import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';
import { Game, User, Prisma, Status, Set, Game_mode } from '@prisma/client';
import { Server } from 'socket.io';
import { CustomSocket } from '@/auth/auth.adapter';
import { GameObject, GameEnded } from './game.object';
import { UserService } from '@/user/user.service';

@Injectable()
export class GameService {
	constructor(private prisma: PrismaService, private readonly userService: UserService) { }

	async game(
		gameWhereUniqueInput: Prisma.GameWhereUniqueInput,
	): Promise<Game | null> {
		return this.prisma.game.findUnique({
			where: gameWhereUniqueInput,
		});
	}

	async games(params: Prisma.GameFindManyArgs): Promise<Game[]> {
		return this.prisma.game.findMany(params);
	}

	async sets(params: Prisma.SetFindManyArgs): Promise<Set[]> {
		return this.prisma.set.findMany(params);
	}

	async prismaCreateGame(data: Prisma.GameCreateInput): Promise<Game> {
		return this.prisma.game.create({
			data,
		});
	}


	async saveGame(gameEnded: GameEnded) {
		let set = await this.prisma.set.create({
			data: {
				set_type: gameEnded.game_type,
				set_winner_login: gameEnded.winner,
				set_loser_login: gameEnded.loser,
				set_winner_score: gameEnded.winner_score,
				set_loser_score: gameEnded.loser_score,
			}
		});
		let games = Promise.all(gameEnded.games.map(async game => {
			await this.prisma.game.create({
				data: {
					game_set_id: set.set_id,
					game_winner_login: game.winner,
					game_loser_login: game.loser,
					game_winner_score: game.winner_score,
					game_loser_score: game.loser_score,
					game_date: new Date()
				}
			})
		}))
	}
	async updateGame(params: {
		where: Prisma.GameWhereUniqueInput;
		data: Prisma.GameUpdateInput;
	}): Promise<Game> {
		const { data, where } = params;
		return this.prisma.game.update({
			data,
			where,
		});
	}
	async startGame(server: Server, roomId: string, mode: Game_mode) {
		console.log('start game');

		const room = server.sockets.adapter.rooms.get(roomId);
		if (!room || room.size !== 2)
			return;
		let it = room.values();
		let player1 = server.sockets.sockets.get(
			it.next().value,
		) as CustomSocket;
		let player2 = server.sockets.sockets.get(
			it.next().value,
		) as CustomSocket;
		console.log(player1.user.login);
		console.log(player2.user.login);
		player1.user_nb = 0;
		player2.user_nb = 1;
		server.to(roomId).emit('game_accepted', roomId);
		const game = new GameObject(server, roomId, mode, player1.user.login, player2.user.login);
		player1.game_lobby = game;
		player2.game_lobby = game;
		const score = await Promise.all([
			this.userService.updateUser({
				where: { login: player1.user.login },
				data: { current_lobby: roomId, status: Status.INGAME },
			}),
			this.userService.updateUser({
				where: { login: player2.user.login },
				data: { current_lobby: roomId, status: Status.INGAME },
			}),
			game.run(),
		]);
		const data = await Promise.all([
			this.userService.updateUser({
				where: { login: player1.user.login },
				data: { current_lobby: null, status: Status.ONLINE },
			}),
			this.userService.updateUser({
				where: { login: player2.user.login },
				data: { current_lobby: null, status: Status.ONLINE },
			}),
			this.saveGame(score[2]),
		]);
		console.log(score[2]);
		server.to(roomId).emit('game_ended', score[2]);
	}

	async deleteGame(where: Prisma.GameWhereUniqueInput): Promise<Game> {
		return this.prisma.game.delete({
			where,
		});
	}

	async deleteGames() {
		return this.prisma.game.deleteMany({});
	}
}

