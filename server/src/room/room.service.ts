import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';
import { Room, User, Prisma, Message } from '@prisma/client';
import { genSalt, hash } from "bcrypt";

@Injectable()
export class RoomService {
	constructor(private prisma: PrismaService) {
		prisma.$on<any>('query', (event: Prisma.QueryEvent) => {
			console.log('Query: ' + event.query);
			console.log('Duration: ' + event.duration + 'ms');
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
	) {
		this.prisma.message_Notification.deleteMany({
			where: {
				room_id: room_id,
				user_login: login
			}
		})
	}
	async joinRoom(
		roomWhereUniqueInput: Prisma.RoomWhereUniqueInput,
		userWhereUniqueInput: Prisma.UserWhereUniqueInput,
		password?: string,
	): Promise<Room | null> {
		const room = await this.prisma.room.findUnique({
			where: roomWhereUniqueInput,
		});
		if (room.room_private === false || room.room_password === password) {
			return this.prisma.room.update({
				where: roomWhereUniqueInput,
				data: {
					room_users: {
						connect: userWhereUniqueInput,
					},
				},
			});
		}
		throw new Error('Wrong password');
	}

	async leaveRoom(
		roomWhereUniqueInput: Prisma.RoomWhereUniqueInput,
		userWhereUniqueInput: Prisma.UserWhereUniqueInput,
	): Promise<Room | null> {
		return this.prisma.room.update({
			where: roomWhereUniqueInput,
			data: {
				room_users: {
					disconnect: userWhereUniqueInput,
				},
			}
		});
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
			case ('addAdmin' || 'removeAdmin'):
				// Check if user is creator of the room
				return await this.prisma.room.count({
					where: {
						room_id: action_room.room_id,
						room_creator: {
							login: action_perfomer
						}
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




			default:
				return false;
		}
	}

	async createRoom(
		roomData: { room_password?: string; room_name: string; room_creator_login: string; room_private: boolean; }
	): Promise<Partial<Room>> {
		let data: Prisma.RoomCreateInput = {
			room_name: roomData['room_name'], room_creator: {
				connect: {
					login: roomData['room_creator_login']
				},
			},
			room_admins: {
				connect: {
					login: roomData['room_creator_login']
				}
			}
			, room_private: roomData['room_private'],
			room_creation_date: new Date(),
			room_password: await hash(roomData['room_password'], 12),
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
		return this.prisma.room.findUnique({
			where: roomWhereUniqueInput,
			include: {
				_count: {
					select: {
						room_users: true,
					}
				},
				room_users: {
					select: {
						login: true,
						nickname: true,
						avatar: true,
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
			}
		});
	}

	async deleteRooms(where: Prisma.RoomWhereUniqueInput)
	{
		this.prisma.room.deleteMany({
			where,
		})
	}

	async deleteRoom(where: Prisma.RoomWhereUniqueInput){
		this.prisma.room.delete({
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

	async addMessage(
		message_content: string,
		message_user_login: string,
		message_room_id: number
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
				message_user: {
					connect: {
						login: message_user_login,
					},
				}
			}
		});
		await this.prisma.message_Notification.create({
			data: {
				message_id: message.message_id,
				room_id: message_room_id,
				user_login: message_user_login,
			}
		});
		return message;
	}

	async deleteMessage(where: Prisma.MessageWhereUniqueInput): Promise<Message> {
		return this.prisma.message.delete({
			where,
		});
	}


	async getMessages(
		where: Prisma.RoomWhereUniqueInput
	): Promise<Message[]> {
		return this.prisma.message.findMany({
			where: {
				message_room_id: where.room_id
			},
			include: {
				message_user: {
					select: {
						nickname: true,
					}
				},
			},
			orderBy: {
				message_time: 'asc'
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
				}
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
}
