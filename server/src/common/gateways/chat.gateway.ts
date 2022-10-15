import { CustomSocket } from "@/auth/auth.adapter";
import { RoomService } from "@/room/room.service";
import { CurrentUser } from "@/user/user.decorator";
import { UserService } from "@/user/user.service";
import { HttpException, HttpStatus, Query, Req } from "@nestjs/common";
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer, WsException } from "@nestjs/websockets"
import { Message, Message_type, Status, User } from "@prisma/client";
import { Socket, Server } from "socket.io"
import { PrismaService } from "@/common/services/prisma.service";
import * as dotenv from 'dotenv'
dotenv.config()

@WebSocketGateway({
	transports: ["websocket"],
	cors: {
		origin: [process.env.FRONTEND_URL],
		credentials: true
	}
})
export class ChatGateway {
	constructor(
		private readonly userService : UserService,
		private readonly prisma : PrismaService,
		private readonly roomService : RoomService
	) {};

	@WebSocketServer()
	server: Server;

	@SubscribeMessage('send_user_message')
	async handleUserMessages(
		@MessageBody() data: Message,
		@ConnectedSocket() client: CustomSocket,
	): Promise<Message> {
		// console.log('message type: ', data.message_room_id);
		if (await (this.roomService.roomPermissions(client.user.login, 'viewRoom', null, { room_id: data.message_room_id },)) == false)
			throw new WsException('Not found');
		const message = await this.roomService.addUserMessage(data.message_content,client.user.login,String(data.message_room_id), client.user.login)
		const users = await this.roomService.getRoomUsers({room_id:data.message_room_id});
		// console.log('message: ', message)
		users.map(async user =>{
			this.server.to('__connected_'+user.login).emit("message", message)
		});
		return message;
	}
	@SubscribeMessage('get_room_messages')
	async getRoomMessage(
		@ConnectedSocket() client : CustomSocket,
		@MessageBody() data : {room_id: number}
	) : Promise<Message[]> {
		const messages = await this.roomService.getRoomMessages(data.room_id);
		return messages.reverse();
	}
	// @SubscribeMessage('join_room')
	// async handleSystemMessage(
	// 	@MessageBody() 
	// )
}
