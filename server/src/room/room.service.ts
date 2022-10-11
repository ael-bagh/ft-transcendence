import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';
import { Room, User, Prisma, Message, Message_type } from '@prisma/client';
import { compare, genSalt, hash } from "bcrypt";

@Injectable()
export class RoomService {
	constructor(private prisma: PrismaService) {
		prisma.$on<any>('query', (event: Prisma.QueryEvent) => {
			console.log(new Date(),'Query: ' + event.query);
			console.log(new Date(),'Duration: ' + event.duration + 'ms');
		});
	}

	// async prismaCreateRoom(data: Prisma.RoomCreateInput): Promise<Room> {
	// 	return this.prisma.room.create({
	// 		data,
	// 	});
	// }

	async seemessages(
		room_id: number,
		login: string
	): Promise<boolean> {
		await this.prisma.message_Notification.deleteMany({
			where: {
				room_id: room_id,
				user_login: login
			}
		})
		return true;
	}
	async joinRoom(
		roomWhereUniqueInput: Prisma.RoomWhereUniqueInput,
		userWhereUniqueInput: Prisma.UserWhereUniqueInput,
		password?: string,
	): Promise<Room | null> {
		let room = await this.prisma.room.findUnique({
			where: roomWhereUniqueInput,
		});
		// console.log(await compare(password, room.room_password));
		if (!room.room_private || await compare(password, room.room_password))
		{
			console.log("ok?")
			room = await this.prisma.room.update({
				where: roomWhereUniqueInput,
				data: {
					room_users: {
						connect: userWhereUniqueInput,
					},
				}
			});
			return room
		}
		throw new Error('Wrong password');
	}

	async roomUsersCount(
		roomWhereUniqueInput: Prisma.RoomWhereUniqueInput,
	): Promise<Number>
	{
		const room = await this.prisma.room.findUnique({
			where: roomWhereUniqueInput,
			include:{
				room_users: true
			}
		});
		return room.room_users.length;
	}

	async leaveRoom(
		roomWhereUniqueInput: Prisma.RoomWhereUniqueInput,
		userWhereUniqueInput: Prisma.UserWhereUniqueInput,
	): Promise<Room | null> {
		return await this.prisma.room.update({
			where: roomWhereUniqueInput,
			data: {
				room_users: {
					disconnect: userWhereUniqueInput,
				},
			}
		});
	}

	async greedySuccessor(
		roomWhereUniqueInput: Prisma.RoomWhereUniqueInput,
	) : Promise<User | null> {
		const room = await this.prisma.room.findUnique({
			where: roomWhereUniqueInput,
			include: {
				room_users: true,
				room_admins: true,
				room_creator: true,
			},
		});
		room.room_users = room.room_users.filter((user) => user.login != room.room_creator_login)
		room.room_admins = room.room_admins.filter((user) => user.login != room.room_creator_login)
		let nextSuccessor: User;
		if (room.room_admins.length > 0)
			nextSuccessor = room.room_admins[0];
		else if (room.room_users.length > 0)
			nextSuccessor = room.room_users[0];
		await this.prisma.room.update({
			where: roomWhereUniqueInput,
			select: {
				room_id: true,
			},
			data: {
				room_creator: {
					connect: {
						login: nextSuccessor.login
					},
				},
				room_admins: {
					disconnect:{
						login:room.room_creator_login
					}
				},
				room_users: {
					disconnect:{
						login:room.room_creator_login
					}
				}
			},
		})
		return null;
	}

	async roomPermissions(
		action_perfomer: string,
		action?: string,
		action_target?: Prisma.UserWhereUniqueInput | null,
		action_room?: Prisma.RoomWhereUniqueInput | null,
		action_message?: Prisma.MessageWhereUniqueInput | null,
	): Promise<boolean> {
		switch (action) {
			case 'viewRoom':
				// Check if user is part of the room
				return await this.prisma.room.count({
					where: {
						room_id: action_room.room_id,
						room_users: {
							some: {
								login: action_perfomer
							}
						},
						NOT: {
							room_banned_users: {
								some: {
									login: action_perfomer
								}
							},
						}
					}
				}).then((count) => count > 0);
			case 'removeAdmin':
			case 'addAdmin':
				console.log("yo", action_room)
				// Check if user is creator of the room
				return await this.prisma.room.count({
					where: {
						room_id: action_room.room_id,
						OR: [
							{
								room_admins: {
									some:
									{
										login: action_perfomer,
									},
								},
							},
							{
								room_creator: {
									login: action_target?.login
								},
							}
						]
					}
				}).then((count) => count > 0);
			// Check if user is creator of the room
			case 'banFromRoom':
				return await this.prisma.room.count({
					where: {
						room_id: action_room.room_id,
						room_admins: {
							some:
							{
								login: action_perfomer,
							},
						},
						NOT:
						{
							OR: [
								{
									room_banned_users: {
										some:
										{

											login: action_target.login
										}
									}
								},
								{
									room_creator: {
										login: action_target?.login
									},
								}
							]
						},

					}
				}).then((count) => count > 0);
			case 'unbanFromRoom':
				return await this.prisma.room.count({
					where: {
						room_id: action_room.room_id,
						room_admins: {
							some:
							{
								login: action_perfomer,
							},
						},
						room_banned_users: {
							some:
							{

								login: action_target?.login
							}
						}
					}
				}).then((count) => count > 0);
			case 'deleteRoom':
				return await this.prisma.room.count({
					where: {
						room_id: action_room.room_id,
						room_creator: {
							login: action_perfomer
						}
					}
				}).then((count) => count > 0);
			case 'joinRoom':
				return await this.prisma.room.count({
					where: {
						room_id: action_room.room_id,
						NOT:
						{

							OR:
								[
									{
										room_banned_users: {
											some: {
												login: action_perfomer
											}
										}
									},
									{
										room_users: {
											some: {
												login: action_perfomer
											}
										},
									}
								]
						},

					}
				}).then((count) => count > 0);
			case 'deleteMessage':
				return (await this.prisma.message.count({
					where: {
						message_id: action_message.message_id,
						message_room: {
							room_id: action_room.room_id,
						},
						message_user: {
							login: action_perfomer
						},
					}
				}).then((count) => count > 0) ||
					await this.prisma.room.count({
						where: {
							room_id: action_room.room_id,
							room_admins: {
								some: {
									login: action_perfomer
								}
							}
						}
					}).then((count) => count > 0));
			case 'seeMessages':
				return (await this.seemessages(action_room.room_id,action_perfomer))
			
			// case 'editRoom':
				// return await this.prisma.room.count({
				// 	where: {
				// 		room_id: action_room.room_id,
				// 		OR:[
				// 			{
				// 				room_creator: {
				// 					login: action_perfomer
				// 				}
				// 			},
				// 			{
				// 				room_admins:{
				// 					some:{
				// 						login: action_perfomer
				// 					}
				// 				}
				// 			}
				// 		]
						
				// 	}
				// }).then((count) => count > 0);

			default:
				return false;
		}
	}

	async createRoom(
		roomData: { room_password?: string; room_name: string; room_creator_login: string; room_private: boolean;room_direct_message : boolean }
	): Promise<Partial<Room>> {
		let data: Prisma.RoomCreateInput = {
			room_name: roomData['room_name'], 
			room_creator: {
				connect: {
					login: roomData['room_creator_login']
				},
			},
			room_admins: {
				connect: {
					login: roomData['room_creator_login']
				},
			},
			room_private: roomData['room_private'],
			room_direct_message: roomData['room_direct_message'],
			room_creation_date: new Date(),
			room_password: (roomData['room_private'] ? await hash(roomData['room_password'], 12):null),
			room_users: {
				connect: {
					login: roomData['room_creator_login']
				}
			}
		};
		return this.prisma.room.create({ data, select: {
			room_id: true,
			room_name:true
		} })
	}

	async rooms(params: Prisma.RoomFindManyArgs): Promise<Room[]> {
		return this.prisma.room.findMany(params);
	}

	async room(
		roomWhereUniqueInput: Prisma.RoomWhereUniqueInput,
	): Promise<Room | null> {
		let room =  await this.prisma.room.findUnique({
			where: roomWhereUniqueInput,
			include: {
				_count: {
					select: {
						room_users: true,
					}
				},
				room_messages: {
					select: {
						message_content: true,
						message_time: true,
						message_user: {
							select: {
								login: true,
							}
						}
					}
				},
			},
		});
		let users = await this.prisma.user.findMany({
			where: {
				rooms_member:{
					some:{
						room_id: roomWhereUniqueInput.room_id
				}
			}
		},
		select:{
			login:true,
			nickname:true,
			avatar:true
		}
		});
		await Promise.all(users.map(async (user) => {
			if (await this.isRoomAdmin(room.room_id, user.login)) {
				user['is_admin'] = true;
			}
			else
				user['is_admin'] = false;
		}));
		room['room_users'] = users;
		return room;
	}

	async isRoomAdmin(
		room_id : number,
		data : string,
	) : Promise<boolean> {
		return await this.prisma.room.count({
			where: {
				room_id: room_id,
				room_admins:{
					some:{
						login: data
					}
				},
			}
		}).then((count) => count > 0);
	}

	async directMessageRoom(
		params : Prisma.RoomFindManyArgs
	):  Promise<Room | null> {
		return this.prisma.room.findFirst(params);
	}

	async deleteRooms(where: Prisma.RoomWhereUniqueInput)
	{
		this.prisma.room.deleteMany({
			where,
		})
	}

	async deleteRoom(where: Prisma.RoomWhereUniqueInput){
		await this.prisma.room.delete({
			where,
		});
	}

	// async updateRoom(
	// 	where: Prisma.RoomWhereUniqueInput,
	// 	data: Prisma.RoomUpdateInput
	// ): Promise<Room> {
	// 	return this.prisma.room.update({
	// 		data,
	// 		where,
	// 	});
	// }

	async unseenMessages(
		room_id: number,
		user: string,
	): Promise<number> {
		return this.prisma.message_Notification.count({
			where: {
				room_id: room_id,
				user_login: user,
			}
		});
	}

	async addSystemMessage(
		message_content: string,
		message_room_id: number,
	): Promise<Message> {
		const message = await this.prisma.message.create({
			data: {
				message_content: message_content,
				message_time: new Date(),
				message_room: {
					connect: {
						room_id: message_room_id,
					},
				},
				message_type: Message_type.SYSTEM
			}
		});
		await this.prisma.message_Notification.create({
			data: {
				message_id: message.message_id,
				room_id: message_room_id,
			}
		});
		return message;
	}

	async addUserMessage(
		message_content: string,
		message_user_login: string,
		message_room_id: string,
		connected_user_login: string,
	): Promise<Message> {
		const message = await this.prisma.message.create({
			data: {
				message_content: message_content,
				message_time: new Date(),
				message_room: {
					connect: {
						room_id: Number(message_room_id),
					},
				},
				message_user: {
					connect: {
						login: message_user_login,
					},
				},
				message_type: Message_type.USER
			}
		});
		const users = (await this.prisma.user.findMany({
			where:{
					rooms_member:{
						some:{
							room_id:Number(message_room_id)
						}
					}
				}
		}));
		await Promise.all(users.map(async user =>{
			console.log(new Date(),'Sender user: ', user.login, 'Connected login: ', connected_user_login)
			if (user.login != connected_user_login)
			await this.prisma.message_Notification.create({
				data: {
					message_id: message.message_id,
					room_id: Number(message_room_id),
					user_login: user.login,
				}
			});
		}));
		return message;
	}

	async deleteMessage(where: Prisma.MessageWhereUniqueInput): Promise<Message> {
		return this.prisma.message.delete({
			where,
		});
	}

	async getMessages(): Promise<Message[]>
	{
		return this.prisma.message.findMany({});
	}


	async getRoomMessages(
		room_id: number,
	): Promise<Message[]> {
		return this.prisma.message.findMany({
			where: {
				message_room_id: room_id
			},
			include: {
				message_user: {
					select: {
						nickname: true,
					}
				},
			},
			orderBy: {
				message_time: 'desc'
			}

		});
	}
	async addRoomUser(
		where: Prisma.RoomWhereUniqueInput,
		data: Prisma.UserWhereUniqueInput
	): Promise<Room> {
		return this.prisma.room.update({
			data: {
				room_users: {
					connect: data
				}
			},
			where,
		});
	}

	async banFromRoom(
		where: Prisma.RoomWhereUniqueInput,
		data: Prisma.UserWhereUniqueInput
	): Promise<Room> {
		return this.prisma.room.update({
			data: {
				room_banned_users: {
					connect: data
				},
				room_users: {
					disconnect: data
				},
				room_admins:{
					disconnect: data
				}
			},
			where,
		});
	}

	async unbanFromRoom(
		where: Prisma.RoomWhereUniqueInput,
		data: Prisma.UserWhereUniqueInput
	): Promise<Room> {
		return this.prisma.room.update({
			data: {
				room_banned_users: {
					disconnect: data
				},
				room_users: {
					connect: data
				},
			},
			where,
		});
	}

	async removeRoomUser(
		where: Prisma.RoomWhereUniqueInput,
		data: Prisma.UserWhereUniqueInput
	): Promise<Room> {
		return this.prisma.room.update({
			data: {
				room_users: {
					disconnect: data
				}
			},
			where,
		});
	}

	async getRoomUsers(
		where: Prisma.RoomWhereUniqueInput
	): Promise<User[]> {
		return this.prisma.room.findUnique({
			where,
		}).room_users();
	}

	async getRoomBannedUsers(
		where: Prisma.RoomWhereUniqueInput
	): Promise<User[]> {
		return this.prisma.room.findUnique({
			where,
		}).room_banned_users();
	}
	async addAdmin(
		where: Prisma.RoomWhereUniqueInput,
		data: Prisma.UserWhereUniqueInput
	): Promise<Room> {
		return this.prisma.room.update({
			data: {
				room_admins: {
					connect: data
				}
			},
			where,
		});
	}
	async removeAdmin(
		where: Prisma.RoomWhereUniqueInput,
		data: Prisma.UserWhereUniqueInput
	): Promise<Room> {
		return this.prisma.room.update({
			data: {
				room_admins: {
					disconnect: data
				}
			},
			where,
		});
	}
	async deleteMessages(
		where: Prisma.RoomWhereUniqueInput,
	){
		return this.prisma.message.deleteMany({})
	}

	// async editRoom(
	// 	where: Prisma.RoomWhereUniqueInput,
	// 	data: {name: string, password: string, is_private: boolean},
	// ) {
	// 	this.prisma.room.update({
	// 		where,
	// 		data: {
	// 			room_name: data.name,
	// 			room_password: data.password,
	// 			room_private: data.is_private
	// 		}
	// 	});
	// }
}
