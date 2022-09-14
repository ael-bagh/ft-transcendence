import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Room, User, Prisma } from '@prisma/client';

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService) { }

	// async prismaCreateRoom(data: Prisma.RoomCreateInput): Promise<Room> {
	// 	return this.prisma.room.create({
	// 		data,
	// 	});
	// }

	async createRoom(
	roomData: { chat_password?: string; chat_name: string; chat_creator_id: number; chat_private: boolean; }
	): Promise<Room>
	{
		let data: Prisma.RoomCreateInput = {chat_name: roomData['chat_name'], chat_creator: {
			connect: {
					user_id: Number(roomData['chat_creator_id'])
			},
		}, chat_private: roomData['chat_private'],
		chat_creation_date: new Date(),
		chat_password: roomData['chat_password']
	};
		return this.prisma.room.create({data})
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

}