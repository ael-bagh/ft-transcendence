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
		@MessageBody() data: {currentRoom:string, time: Date, user_login:string, message:string,  },
		@ConnectedSocket() client: CustomSocket,
	): Promise<Message> {
		console.log(data);
		if (await (this.roomService.roomPermissions(client.user.login, 'viewRoom', null, { room_id: parseInt(data.currentRoom) },)) == false)
			throw new WsException('Not found');
		const message = await this.roomService.addUserMessage(data.message,client.user.login,data.currentRoom)
		this.server.to(data.currentRoom).emit("message", message);
		console.log("test_me ", message);
		return message;
	}
	// @SubscribeMessage('join_room')
	// async handleSystemMessage(
	// 	@MessageBody() 
	// )
}
