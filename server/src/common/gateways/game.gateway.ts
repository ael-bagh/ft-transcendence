const Crypto = require('crypto');
import { CustomSocket } from '@/auth/auth.adapter';
import { GameService } from '@/game/game.service';
import { UserService } from '@/user/user.service';
import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsException,
} from '@nestjs/websockets';
import { Game_mode, Status } from '@prisma/client';
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
		client.user = await this.userService.user({login: client.user.login})
		if (!['ONE', 'RANKED', 'NORMAL'].includes(userData?.mode) || !userData?.target_login)
			throw new WsException('data not given');
		if (userData.target_login === client.user.login || client.user.status !== Status.ONLINE)
			throw new WsException('Action Unavailable');
		let login = client.user.login;
		let target_login = userData.target_login;
		let allowed = await this.userService.permissionToDoAction({
			action_performer: login,
			action_target: target_login,
			action_mutual: true
		});
		if (!allowed)
			throw new WsException('Not allowd');
		const opp = await this.userService.user({login: target_login})
		if (opp.status !== Status.ONLINE)
			throw new WsException('Player Unavailable')
		client.user = await this.userService.updateUser({
			where: {
				login: client.user.login
			},
			data: {
				status: Status.INQUEUE
			}
		})
		const room = Crypto.randomBytes(20).toString('hex');
		client.join(room);
		this.server.to(`__connected_${target_login}`).emit('game_request', {target_login : client.user.login, mode : userData.mode, roomId: room});
	}


	@SubscribeMessage('accept_game_request')
	async acceptGameRequest(
		@MessageBody() userData: { target_login: string, isAccepted: boolean, mode: Game_mode, roomId: string },
		@ConnectedSocket() client: CustomSocket,
	) {
		client.user = await this.userService.user({login: client.user.login})
		if (!['ONE', 'RANKED', 'NORMAL'].includes(userData?.mode) || userData?.target_login === undefined || userData?.isAccepted === undefined)
			throw new WsException('data not given');
		let login = client.user.login;
		let target_login = userData.target_login
		if (!target_login) {
			throw new WsException('Not found');
		}
		let allowed = await this.userService.permissionToDoAction({
			action_performer: login,
			action_target: target_login,
			action_mutual: true
		});
		if (!allowed)
			throw new WsException('Not found');
		if (this.server.sockets.adapter.rooms.get(userData.roomId).size !== 1)
			throw new WsException('player gone');
		if (!userData.isAccepted)
		{
			this.server.to(userData.roomId).emit('game_accepted', 'refused');
			const queue = this.server.sockets.adapter.rooms.get(userData.roomId);
			let matching_opp = this.server.sockets.sockets.get(
				queue.values().next().value,
			) as CustomSocket;
			matching_opp.leave(userData.roomId);
			matching_opp.user = await this.userService.updateUser({
				where: {
					login: matching_opp.user.login
				},
				data: {
					status: Status.ONLINE
				}
			})
			return;
		}
		client.join(userData.roomId);
		this.gameService.startGame(this.server, userData.roomId, userData.mode);
	}

	@SubscribeMessage('join_game_queue')
	async joinGameQueue(
		@MessageBody() userData: { mode: Game_mode },
		@ConnectedSocket() client: CustomSocket) {
		client.user = await this.userService.user({login: client.user.login})
		if (!['ONE', 'RANKED', 'NORMAL'].includes(userData?.mode))
			throw new WsException('data not given');
		if (client.user.status != Status.ONLINE)
			throw new WsException('Action Unavailable');
		client.user = await this.userService.updateUser({
			where: {
				login: client.user.login
			},
			data: {
				status: Status.INQUEUE
			}
		})
		client.inQueue = true;
		this.gateWayService.broadcastStatusChangeToFriends(
			this.server,
			this.userService,
			client.user
		);
		if (!this.server.sockets.adapter.rooms.has('__game_queue' + userData.mode)) {
			client.join('__game_queue' + userData.mode);
			return;
		}
		const queue = this.server.sockets.adapter.rooms.get('__game_queue' + userData.mode);
		let matching_opp = this.server.sockets.sockets.get(
			queue.values().next().value,
		) as CustomSocket;
		if (matching_opp.user.login == client.user.login) {
			this.server.to('__connected_' + client.user.login).emit('i_am_you');
			return;
		}
		matching_opp.inQueue = false;
		matching_opp.leave('__game_queue' + userData.mode);
		const game_lobby = Crypto.randomBytes(20).toString('hex');
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
		
		if (res[0] == true && res[1] == true) {
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
		@MessageBody() userData: {mode: Game_mode},
        @ConnectedSocket() client: CustomSocket,
    ) {
		client.user = await this.userService.user({login: client.user.login})
		if (!['ONE', 'RANKED', 'NORMAL'].includes(userData?.mode))
			throw new WsException('data not given');
		let found = false;
		if (client.user.status == Status.INQUEUE)
		{
			this.server.sockets.adapter.rooms.get('__game_queue' + userData.mode).forEach( async (socketId) => {
				const socket = this.server.sockets.sockets.get(socketId) as CustomSocket;
				if (socket.rooms.has('__game_queue' + userData.mode))
				{
					socket.leave('__game_queue' + userData.mode);
					socket.inQueue = false;
					client.emit('queue_quitted', 'ok');
					found = true;
					client.user = await this.userService.updateUser({
						where: {
							login: client.user.login
						},
						data: {
							status: Status.ONLINE
						}
					})
				}
			});
		}
        if (!found)
            throw new WsException('not in queue');
    }

	@SubscribeMessage('spectate')
    async spectate(
		@MessageBody() userData: {target_login?: string, target_lobby?: string},
        @ConnectedSocket() client: CustomSocket,
    ) {
		client.user = await this.userService.user({login: client.user.login})
		if (userData.target_login)
		{
			const target = await this.userService.user({login: userData.target_login})
			if (!target)
				throw new WsException('user not found');
			if (target.status != Status.INGAME)
				throw new WsException('user not in game');
			client.join(target.current_lobby);
			return {lobby :target.current_lobby}
		}
		if (userData.target_lobby)
		{
			const room = await this.prisma.user.count({
				where: {
					current_lobby: userData.target_lobby,
				}
			})
			if (room == 0)
				throw new WsException('room not found');
			client.join(userData.target_lobby);
			return {lobby:userData.target_lobby}
			
		}
		throw new WsException('data not given');
    }
	@SubscribeMessage('move')
	async move(
		@ConnectedSocket() client: CustomSocket,
		@MessageBody() data: number,
	) {
		
		if (!client.game_lobby || !client.game_lobby.gameStarted)
			return;
		const game = client.game_lobby;
		if (data > 0) game.mov[client.user_nb] = 1;
		else if (data < 0) game.mov[client.user_nb] = -1;
		else game.mov[client.user_nb] = 0;
	}

	@SubscribeMessage('quitGame')
    async quitGame(
		@MessageBody() userData: {target_lobby: string},
        @ConnectedSocket() client: CustomSocket,
    ) {
		client.user = await this.userService.user({login: client.user.login})
		if(client.user.current_lobby === userData.target_lobby)
		{
			if (client.game_lobby !== undefined) {
				client.game_lobby.forceEnd(client.user.login);
			}
		}
		else
			client.leave(userData.target_lobby);	
    }
}
