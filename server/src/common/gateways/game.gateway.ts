import { CustomSocket } from "@/auth/auth.adapter";
import { GameObject } from "@/game/game.object";
import { GameService } from "@/game/game.service";
import { CurrentUser } from "@/user/user.decorator";
import { UserService } from "@/user/user.service";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Status, User } from "@prisma/client";
import { Socket } from "dgram";
import passport from "passport";
import { Server } from "socket.io";
import { PrismaService } from "../services/prisma.service";

@WebSocketGateway({
	transports: ["websocket"],
	cors: {
		origin: ['http://localhost:8081'],
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

	@SubscribeMessage('join_game_invit')
	async joinGameInvit(
		@ConnectedSocket() client : CustomSocket,
		@MessageBody() data : string
	) {
		const user = await this.userService.user({login:data});
		if (!user || user.status == Status.OFFLINE || user.status == Status.INGAME)
			return;
		this.server.to("__connected_"+user.login).emit("come_play", client.user.login);
	}

	@SubscribeMessage('join_game_queue')
	async joinGameQueue(
		@ConnectedSocket() client : CustomSocket
	) {
		if (!this.server.sockets.adapter.rooms.has('__game_queue'))
		{	
			client.join('__game_queue');
			console.log('joined game')
			return;
		}
		
		const queue = this.server.sockets.adapter.rooms.get('__game_queue');
		console.log(queue.values().next().value);
		console.log(queue.size);
		const matching_opp = this.server.sockets.sockets.get(queue.values().next().value) as CustomSocket;
		console.log(matching_opp.user, "hihi");
		matching_opp.leave('__game_queue');
		client.user_nb = 0;
		matching_opp.user_nb = 1;
		const game_lobby = client.id+matching_opp.id;
		const game = new GameObject(this.server, game_lobby, this.gameService);
		client.game_lobby = game;
		matching_opp.game_lobby = game;
		client.join(game_lobby);
		matching_opp.join(game_lobby);

		this.server.to(game_lobby).emit('match_found', "mebrouk")
		// game.run();
		// console.log(score);
		// let game_room_id = client.id+matching_opp[Symbol('id')]
		// client.join(String(game.game_id));
		// matching_opp[Symbol('game_lobby')] = game; // game lobby object


		// console.log(this.server.sockets.adapter.rooms.has('__game_queue'), 'empty');
	}
	@SubscribeMessage('move')
	async move(
		@ConnectedSocket() client : CustomSocket,
		@MessageBody() data: number,
	) {console.log(data);
		if (!client.game_lobby || !client.game_lobby.gameStarted)
			return;
		console.log(data);
		const game = client.game_lobby;
		if (data > 0)
			game.mov[client.user_nb] = 1;
		else if (data < 0)
			game.mov[client.user_nb] = -1;
		else
			game.mov[client.user_nb] = 0;
	}


}