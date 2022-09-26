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
		private readonly roomServece : RoomService
	) {};

	@WebSocketServer()
	server: Server;

	@SubscribeMessage('test_me')
	handleMessages(
		@MessageBody() data: any,
		@ConnectedSocket() client: CustomSocket,
	): string {
		console.log("test_me");
		return data;
	}

	
}
