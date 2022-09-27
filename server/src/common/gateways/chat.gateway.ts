import { CustomSocket } from "@/auth/auth.adapter";
import { RoomService } from "@/room/room.service";
import { CurrentUser } from "@/user/user.decorator";
import { UserService } from "@/user/user.service";
import { Query, Req } from "@nestjs/common";
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from "@nestjs/websockets"
import { Status, User } from "@prisma/client";
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

	@SubscribeMessage('send_message')
	handleMessages(
		@MessageBody() data: any,
		@ConnectedSocket() client: CustomSocket,
	): any {
		const message = this.roomService.addMessage(data.message,client.user.login,data.room_id)
		this.server.to(data.room_id).emit("message", message);
		console.log("test_me ", message);
		return message;
	}

	
}
