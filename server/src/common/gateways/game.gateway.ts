import { CustomSocket } from '@/auth/auth.adapter';
import { GameObject } from '@/game/game.object';
import { GameService } from '@/game/game.service';
import { UserService } from '@/user/user.service';
import { HttpException, HttpStatus } from "@nestjs/common";
import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Game_mode, Status } from '@prisma/client';
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
		origin: [process.env.FRONTEND_URL],
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

	@SubscribeMessage('invite_to_game')
	async sendRequest(
		@MessageBody() userData: { target_login: string , mode: Game_mode},
		@ConnectedSocket() client: CustomSocket,
	) {
		let login = client.user.login;
		let target_login = userData.target_login;
		if (!target_login) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		let allowed = await this.userService.permissionToDoAction({
			action_performer: login,
			action_target: target_login,
			action_mutual: true
		});
		if (!allowed)
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		client.join(client.user.login + target_login);
		this.server.to(`__connected_${target_login}`).emit('game_request', client.user.login, userData.mode);
	}

	@SubscribeMessage('accept_game_request')
	async acceptGameRequest(
		@MessageBody() userData: { target_login: string, isAccepted: boolean, mode: Game_mode},
		@ConnectedSocket() client: CustomSocket,
	) {
		let login = client.user.login;
		let target_login = userData.target_login
		if (!target_login) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		let allowed = await this.userService.permissionToDoAction({
			action_performer: login,
			action_target: target_login,
			action_mutual: true
		});
		if (!allowed)
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		const room = target_login+client.user.login;
		
		if (this.server.sockets.adapter.rooms.get(room).size !== 1)
		{
			throw new Error('player gone');
		}
		if (!userData.isAccepted)
		{
			this.server.to(room).emit('game_accepted', 'refused');
			const queue = this.server.sockets.adapter.rooms.get(room);
			let matching_opp = this.server.sockets.sockets.get(
				queue.values().next().value,
			) as CustomSocket;
			matching_opp.leave(room);
			return;
		}
		client.join(room);
		this.gameService.startGame(this.server, room, userData.mode);
	}
	
	@SubscribeMessage('join_game_queue')
	async joinGameQueue(
		@MessageBody() userData: { mode: Game_mode },
		@ConnectedSocket() client: CustomSocket) {
		console.log('join game queue');
		client.user = await this.userService.updateUser({
			where: {
				login: client.user.login
			},
			data: {
				status: Status.INQUEUE
			}
		})
		userData.mode = Game_mode.RANKED;
		console.log(client.user);
		this.gateWayService.broadcastStatusChangeToFriends(
			this.server,
			this.userService,
			client.user
		);
		if (!this.server.sockets.adapter.rooms.has('__game_queue' + userData.mode)) {
			client.join('__game_queue' + userData.mode);
			console.log('joined game');
			return;
		}
		console.log('game found');
		const queue = this.server.sockets.adapter.rooms.get('__game_queue' + userData.mode);
		let matching_opp = this.server.sockets.sockets.get(
			queue.values().next().value,
		) as CustomSocket;
		if (matching_opp.user.login == client.user.login) {
			console.log('same person');
			this.server.to('__connected_' + client.user.login).emit('i_am_you');
			return;
		}
		console.log(matching_opp.user, 'hihi');
		matching_opp.leave('__game_queue' + userData.mode);
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
			}));
		  };
		const res = await Promise.all([wait_res(client), wait_res(matching_opp)]);
		console.log(res[0], res[1]);
		
		if (res[0] == true && res[1] == true) {
			console.log('starting game');
			this.gameService.startGame(this.server, game_lobby, userData.mode);
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
		@MessageBody() userData: { mode: Game_mode },
        @ConnectedSocket() client: CustomSocket,
    ) {

        if (client.rooms.has('__game_queue' + userData.mode))
        {
            client.leave('__game_queue' + userData.mode);
			
            client.emit('queue_quitted', 'ok');
			console.log('quitted queue');
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
