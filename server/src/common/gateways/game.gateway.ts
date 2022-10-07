import { CustomSocket } from '@/auth/auth.adapter';
import { GameObject } from '@/game/game.object';
import { GameService } from '@/game/game.service';
import { UserService } from '@/user/user.service';
import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Status } from '@prisma/client';
import { Socket } from 'dgram';
import { resolve } from 'path';
import { Server } from 'socket.io';
import { GatewayService } from '../services/gateway.service';
import { PrismaService } from '../services/prisma.service';
import * as dotenv from 'dotenv'
dotenv.config()

@WebSocketGateway({
	transports: ['websocket'],
	cors: {
		origin: ['http://localhost:8081'],
		credentials: true,
	},
})
export class GameGateway {
	constructor(
		private readonly userService: UserService,
		private readonly prisma: PrismaService,
		private readonly gameService: GameService,
		private readonly gateWayService: GatewayService,
	) { }

	@WebSocketServer()
	server: Server;

	@SubscribeMessage('join_game_invit')
	async joinGameInvit(
		@ConnectedSocket() client: CustomSocket,
		@MessageBody() data: string,
	) {
		const user = await this.userService.user({ login: data });
		if (!user || user.status == Status.OFFLINE || user.status == Status.INGAME)
			return;
		this.server
			.to('__connected_' + user.login)
			.emit('come_play', client.user.login);
	}

	@SubscribeMessage('join_game_queue')
	async joinGameQueue(@ConnectedSocket() client: CustomSocket) {
		client.user = await this.userService.updateUser({
			where: {
				login: client.user.login
			},
			data: {
				status: Status.INQUEUE
			}
		})
		this.gateWayService.broadcastStatusChangeToFriends(
			this.server,
			this.userService,
			client.user
		);
		if (!this.server.sockets.adapter.rooms.has('__game_queue')) {
			client.join('__game_queue');
			console.log('joined game');
			return;
		}
		// this.server.to()
		const queue = this.server.sockets.adapter.rooms.get('__game_queue');
		// console.log(queue.values().next().value);
		// console.log(queue.size);
		let matching_opp = this.server.sockets.sockets.get(
			queue.values().next().value,
		) as CustomSocket;
		if (matching_opp.user.login == client.user.login) {
			console.log('same person');
			this.server.to('__connected_' + client.user.login).emit('i_am_you');
			return;
		}
		console.log(matching_opp.user, 'hihi');
		matching_opp.leave('__game_queue');
		client.user_nb = 0;
		matching_opp.user_nb = 1;
		
		
		console.log('accepting game');
		const game_lobby = client.id + matching_opp.id;
		client.join(game_lobby);
		matching_opp.join(game_lobby);
		this.server.to(game_lobby).emit('accept_game', 'go');
		
		const wait_res  = (sock:CustomSocket) => {
			return new Promise<Boolean>(((resolve , reject) => {
				sock.on("accept_response", (obj: {isAccepted :Boolean}) => {
				resolve(obj.isAccepted);
			  });
			  	// setTimeout(() => (resolve(false)), 5000);
			}));
		  };
		const res = await Promise.all([wait_res(client), wait_res(matching_opp)]);
		console.log(res[0], res[1]);
		
		if (res[0] == true && res[1] == true) {
			this.server.to(game_lobby).emit('game_accepted', game_lobby);
			
			const game = new GameObject(this.server, game_lobby, this.gameService);
			client.game_lobby = game;
			matching_opp.game_lobby = game;
			const score = await Promise.all([
				this.userService.updateUser({
					where: { login: client.user.login },
					data: { current_lobby: game_lobby, status: Status.INGAME },
				}),
				this.userService.updateUser({
					where: { login: matching_opp.user.login },
					data: { current_lobby: game_lobby, status: Status.INGAME },
				}),
				game.run(),
			]);
			console.log('!!!!!!!!!!!!!!scores ', score);
			let gameData: {
				game_winner_login: string;
				game_loser_login: string;
				game_winner_score: number;
				game_loser_score: number;
			};
			if (score[2][0] < score[2][1]) {
				[client, matching_opp] = [matching_opp, client];
			}
			gameData = {
				game_winner_login: client.user.login,
				game_loser_login: matching_opp.user.login,
				game_winner_score: score[2][client.user_nb],
				game_loser_score: score[2][matching_opp.user_nb],
			};
			const data = await Promise.all([
				this.userService.updateUser({
					where: { login: client.user.login },
					data: { current_lobby: null, status: Status.ONLINE },
				}),
				this.userService.updateUser({
					where: { login: matching_opp.user.login },
					data: { current_lobby: null, status: Status.ONLINE },
				}),
				this.gameService.saveGame(gameData),
			]);
			console.log(data);
			this.server.to(game_lobby).emit('game_ended', data);
		}
		else
		{
			this.server.to(game_lobby).emit('game_accepted', 'refused');
			client.leave(game_lobby);
			matching_opp.leave(game_lobby);
		}
	}
	@SubscribeMessage('quit_queue')
    async quitQueue(
        @ConnectedSocket() client: CustomSocket,
    ) {
        if (client.rooms.has('__game_queue'))
        {
            client.leave('__game_queue');
            client.emit('queue_quitted', 'ok');
        }
        else
        {
            throw new Error('not in queue');
        }
    }

	@SubscribeMessage('move')
	async move(
		@ConnectedSocket() client: CustomSocket,
		@MessageBody() data: number,
	) {
		console.log(data);
		if (!client.game_lobby || !client.game_lobby.gameStarted) return;
		console.log(data);
		const game = client.game_lobby;
		if (data > 0) game.mov[client.user_nb] = 1;
		else if (data < 0) game.mov[client.user_nb] = -1;
		else game.mov[client.user_nb] = 0;
	}
}
