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
import { GameService } from "@/game/game.service";
import { GatewayService } from "../services/gateway.service";
import { NotificationService } from "@/notification/notification.service";
import { Client } from "socket.io/dist/client";
dotenv.config()

@WebSocketGateway({
	transports: ["websocket"],
	cors: {
		origin: [process.env.FRONTEND_URL],
		credentials: true
	}
})
export class NotificationGateway{
	constructor(
		private readonly notificationService: NotificationService,
		private readonly prisma: PrismaService,
		private readonly gameService: GameService,
		private readonly gateWayService: GatewayService,
	) { }

	@WebSocketServer()
	server: Server;

	@SubscribeMessage('dismiss')
	async thisMiss(
		@MessageBody() data : {id : number},
		@ConnectedSocket() client: CustomSocket 
	) : Promise<number> {
		await this.notificationService.deleteNotification(data.id);
		this.server.to(`__connected_${client.user.login}`).emit('notification', { notification_id: data.id, notification_type: '' });
		return data.id;
	}


}