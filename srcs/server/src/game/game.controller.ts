import {
	Controller,
	Get,
	Param,
	UseGuards,
	HttpException,
	HttpStatus,
} from '@nestjs/common';

import { GameService } from '@/game/game.service';
import { Game as GameModel, User as UserModel, Set as SetModel } from '@prisma/client';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { UserService } from '@/user/user.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class GameController {
	constructor(private readonly gameService: GameService, private readonly userService: UserService) { }
	@Get('/games')
	async getGames(): Promise<GameModel[]> {
		try {
			return await this.gameService.games({});
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return [];
		}
	}
	@Get('/games/:id')
	async getGame(@Param('id') id: string): Promise<GameModel> {
		try {
			return await this.gameService.game({ game_id: id });
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return null;
		}
	}
	@Get('/:login/games')
	async getGamesByLogin(@Param('login') login: string): Promise<GameModel[]> {
		try {
			return await this.gameService.games({
				where: {
					OR: [
						{
							game_winner_login: login
						},
						{
							game_loser_login: login
						},
					]
				}
			});
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return [];
		}
	}

	@Get(['leaderboard', 'leaderboard/:page'])
	async getLeaderboardPage(@Param('page') page: number): Promise<UserModel[]> {
		try {
			if (page && Number(page) == NaN)
				throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
			if (page && Number(page) * 20 > (await this.userService.users({})).length)
				throw new HttpException('Page Not Found', HttpStatus.NOT_FOUND);
			page = page ?? 0;
			return await this.gameService.leaderboard(page);
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return [];
		}
	}
	@Get('/:login/:mode/stats')
	async getStats(@Param() params: { login: string, mode: string }) {
		try {
			params.mode = params.mode.toUpperCase()
			if (params.mode == "RANKED" || params.mode == "NORMAL" || params.mode == "ONE") {
				return await this.gameService.stats(params.login, params.mode);
			}
			else
				throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return null;
		}
	}
	@Get('/:login/sets')
	async getSets(@Param('login') login: string): Promise<SetModel[]> {
		try {
			return await this.gameService.sets({
				where: {
					OR: [
						{
							set_winner_login: login
						},
						{
							set_loser_login: login
						},
					]
				},
				include: {
					set_games: true
				},
				orderBy: { set_date: 'desc' },
			});
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return [];
		}
	}
}
