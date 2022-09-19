import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Room, User, Prisma, Message } from '@prisma/client';

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService) { }

	// async prismaCreateRoom(data: Prisma.RoomCreateInput): Promise<Room> {
	// 	return this.prisma.room.create({
	// 		data,
	// 	});
	// }

	async chatPermissions(
		action_perfomer: Prisma.UserWhereUniqueInput,
		action: string,
		action_target: Prisma.UserWhereUniqueInput | null,
		action_room: Prisma.RoomWhereUniqueInput | null,
	): Promise<boolean> {
		switch (action) {
			case 'viewChat':
				// Check if user is part of the room
				if (action_room != null) {
					return await this.prisma.room.count({
						where: {
							chat_id: action_room.chat_id,
							chat_users:{
								some: {
									login: action_perfomer.login
								}
							},
							chat_banned_users:{
								some: {
									NOT: {
										login: action_perfomer.login
									}
								}
							},
						}
					}).then((count) => count > 0);
				}
			case ('addAdmin' || 'removeAdmin'):
				// Check if user is creator of the room
				if (action_room != null) {
					return await this.prisma.room.count({
						where: {
							chat_id: action_room.chat_id,
							chat_creator: {
								login: action_perfomer.login
							}
						}
					}).then((count) => count > 0);
					}
				// Check if user is creator of the room
			case 'banFromRoom' || 'unbanFromRoom':
				if (action_room != null) {
					return await this.prisma.room.count({
						where: {
							chat_id: action_room.chat_id,
							chat_admins: {
								some:
								{
									login: action_perfomer.login,
									NOT:
									{
										login: action_target?.login
									}
								}
							},
							chat_banned_users: {
								some:
								{
									NOT:
									{
										login: action_target.login
									}
								}
							}

						}
					}).then((count) => count > 0);
				}
				return false;
		}
	}

	async createRoom(
		roomData: { chat_password?: string; chat_name: string; chat_creator_id: number; chat_private: boolean; }
	): Promise<Room> {
		let data: Prisma.RoomCreateInput = {
			chat_name: roomData['chat_name'], chat_creator: {
				connect: {
					user_id: Number(roomData['chat_creator_id'])
				},
			}, 
			chat_admins:{
				connect: {
					user_id: Number(roomData['chat_creator_id'])
				}
			}
			,chat_private: roomData['chat_private'],
			chat_creation_date: new Date(),
			chat_password: roomData['chat_password'],
			chat_users: {
				connect: {
					user_id: Number(roomData['chat_creator_id'])
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
				message_chat: {
					connect: {
						chat_id: where.chat_id
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
				message_chat_id: where.chat_id
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
				chat_users: {
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
				chat_users: {
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
		}).chat_users();
	}
}
