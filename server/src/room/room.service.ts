import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';
import { Room, User, Prisma, Message } from '@prisma/client';

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
	async joinRoom(
		roomWhereUniqueInput: Prisma.RoomWhereUniqueInput,
		userWhereUniqueInput: Prisma.UserWhereUniqueInput,
	): Promise<Room | null> {
		return this.prisma.room.update({
			where: roomWhereUniqueInput,
			data: {
				room_users: {
					connect: userWhereUniqueInput,
				},
			},
		});
	}
	async roomPermissions(
		action_perfomer: string,
		action: string,
		action_target: Prisma.UserWhereUniqueInput | null,
		action_room: Prisma.RoomWhereUniqueInput | null,
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
			case 'banFromRoom' || 'unbanFromRoom':
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
							room_admins: {
								some: {

									login: action_target?.login
								}
							},
							OR:{
								room_banned_users: {
									some:
									{
										
											login: action_target.login
										}
									}
							}
							
						},
						

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
							room_users: {
								some: {
									login: action_perfomer
								}
							},
							OR:
							{
								room_banned_users: {
									some: {
										login: action_perfomer
									}
								}
							}
						},
						
					}
				}).then((count) => count > 0);

			default:
				return false;
		}
	}

	async createRoom(
		roomData: { room_password?: string; room_name: string; room_creator_login: string; room_private: boolean; }
	): Promise<Room> {
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
			room_password: roomData['room_password'],
			room_users: {
				connect: {
					login: roomData['room_creator_login']
				}
			}
		};
		return this.prisma.room.create({ data })
	}

	async rooms(params: Prisma.RoomFindManyArgs): Promise<Room[]> {
		return this.prisma.room.findMany(params);
	}

	async room(
		roomWhereUniqueInput: Prisma.RoomWhereUniqueInput,
	): Promise<Room | null> {
		return this.prisma.room.findUnique({
			where: roomWhereUniqueInput,
		});
	}

	async deleteRoom(where: Prisma.RoomWhereUniqueInput): Promise<Room> {
		return this.prisma.room.delete({
			where,
		});
	}

	async updateRoom(params: {
		where: Prisma.RoomWhereUniqueInput;
		data: Prisma.RoomUpdateInput;
	}): Promise<Room> {
		const { data, where } = params;
		return this.prisma.room.update({
			data,
			where,
		});
	}

	async addMessage(params: {
		where: Prisma.RoomWhereUniqueInput;
		data: Prisma.MessageCreateInput;
	}): Promise<Message> {
		const { data, where } = params;
		const message = this.prisma.message.create({
			data: {
				...data,
				message_room: {
					connect: {
						room_id: where.room_id
					}
				}
			},
		});
		return message;
	}

	async getMessages(params: {
		where: Prisma.RoomWhereUniqueInput;
	}): Promise<Message[]> {
		const { where } = params;
		return this.prisma.message.findMany({
			where: {
				message_room_id: where.room_id
			}
		});
	}

	async addRoomUser(params: {
		where: Prisma.RoomWhereUniqueInput;
		data: Prisma.UserWhereUniqueInput;
	}): Promise<Room> {
		const { data, where } = params;
		return this.prisma.room.update({
			data: {
				room_users: {
					connect: data
				}
			},
			where,
		});
	}

	async removeRoomUser(params: {
		where: Prisma.RoomWhereUniqueInput;
		data: Prisma.UserWhereUniqueInput;
	}): Promise<Room> {
		const { data, where } = params;
		return this.prisma.room.update({
			data: {
				room_users: {
					disconnect: data
				}
			},
			where,
		});
	}

	async getRoomUsers(params: {
		where: Prisma.RoomWhereUniqueInput;
	}): Promise<User[]> {
		const { where } = params;
		return this.prisma.room.findUnique({
			where,
		}).room_users();
	}
}
