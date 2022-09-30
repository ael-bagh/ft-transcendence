import { CustomSocket } from "@/auth/auth.adapter";
import { GameService } from "@/game/game.service";
import { CurrentUser } from "@/user/user.decorator";
import { UserService } from "@/user/user.service";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import passport from "passport";
import { Server } from "socket.io";
import { PrismaService } from "../services/prisma.service";

@WebSocketGateway({
	transports: ["websocket"],
	cors: {
		origin: ['http://frontend.transcendance.com'],
		credentials: true
	}
})
export class GameGateway {
	constructor(
		private readonly userService : UserService,
		private readonly prisma : PrismaService,
		private readonly gameService : GameService,

	) {};

	@WebSocketServer()
	server: Server;

	@SubscribeMessage('join_game_queue')
	async joinGameQueue(
		@ConnectedSocket() client : CustomSocket,
		@MessageBody() data : any
	) {
		if (this.server.sockets.adapter.rooms['pending'].size() > 0)
		{}
	}

	@SubscribeMessage('join_game_invit')
	async joinGameInvit(
		@ConnectedSocket() client : CustomSocket,
		@MessageBody() data : any
	) {
		
	}
}