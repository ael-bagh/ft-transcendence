import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Put,
	Delete,
} from '@nestjs/common';
import { Room } from '@prisma/client';
import { ChatService } from './chat.service';


@Controller()
export class ChatController {
	constructor(private readonly chatService: ChatService) { }

	@Get('/rooms')
	async getRooms(): Promise<Room[]> {
		return this.chatService.rooms({});
	}

	@Get('/rooms/:id')
	async getRoom(@Param('id') id: string): Promise<Room | null> {
		return this.chatService.room({ chat_id: Number(id) });
	}
}