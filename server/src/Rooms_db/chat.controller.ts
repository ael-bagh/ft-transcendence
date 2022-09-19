import {
	Controller,
	Get,
	Param,
	Post,
	Query,
} from '@nestjs/common';
import { Room } from '@prisma/client';
import { ChatService } from '@/Rooms_db/chat.service';


@Controller("rooms")
export class ChatController {
	constructor(private readonly chatService: ChatService) { }

	@Get('')
	async getRooms(): Promise<Room[]> {
		return this.chatService.rooms({});
	}

	@Get(':id')
	async getRoom(@Param('id') id: string): Promise<Room | null> {
		return this.chatService.room({ chat_id: Number(id) });
	}

	@Post("createRoom")
	async createRoom(@Param() params: any): Promise<Room> {
		const { name, creator, is_private }:{name:string,creator:string,is_private:Boolean} = params;
		return this.chatService.createRoom({chat_name: name, chat_creator_login: creator, chat_private: Boolean(is_private)});

	}
}