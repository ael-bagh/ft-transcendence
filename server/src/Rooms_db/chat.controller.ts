import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Put,
	Delete,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
  } from '@nestjs/swagger';

import { Room } from '@prisma/client';
import { ChatService } from './chat.service';


@Controller()
export class ChatController {
	constructor(private readonly chatService: ChatService) { }

	@Get('/rooms')
	@ApiOperation({ summary: 'Get all chat rooms that the current logged in user is part of' })
	async getRooms(): Promise<Room[]> {
		return this.chatService.rooms({});
	}

	@Get('/rooms/:id')
	@ApiOperation({ summary: 'Get a specific chat room' })
	async getRoom(@Param('id') id: string): Promise<Room | null> {
		return this.chatService.room({ chat_id: Number(id) });
	}
}