import { CustomSocket } from "@/auth/auth.adapter";
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from "@nestjs/websockets"
import { Server } from "socket.io"
import { PrismaService } from "@/common/services/prisma.service";
import * as dotenv from 'dotenv'
import { GameService } from "@/game/game.service";
import { GatewayService } from "../services/gateway.service";
import { NotificationService } from "@/notification/notification.service";
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