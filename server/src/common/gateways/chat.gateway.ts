import { CustomSocket } from "@/auth/auth.adapter";
import { RoomService } from "@/room/room.service";
import { CurrentUser } from "@/user/user.decorator";
import { UserService } from "@/user/user.service";
import { HttpException, HttpStatus, Query, Req } from "@nestjs/common";
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from "@nestjs/websockets"
import { Message, Message_type, Status, User } from "@prisma/client";
import { Socket, Server } from "socket.io"
import { PrismaService } from "@/common/services/prisma.service";

@WebSocketGateway({
	transports: ["websocket"],
	cors: {
		origin: ['http://frontend.transcendance.com'],
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
		@MessageBody() data: any,
		@ConnectedSocket() client: CustomSocket,
	): Promise<Message> {
		console.log(data);
		if (await (this.roomService.roomPermissions(client.user.login, 'viewRoom', null, { room_id: Number(data.room_id) },)) == false)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		const message = await this.roomService.addUserMessage(data.message,client.user.login,data.room_id)
		this.server.to(data.room_id).emit("message", message);
		console.log("test_me ", message);
		return message;
	}
	// @SubscribeMessage('join_room')
	// async handleSystemMessage(
	// 	@MessageBody() 
	// )
}
