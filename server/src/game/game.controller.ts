import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Put,
	Delete,
	UseGuards,
	HttpException,
	HttpStatus,
} from '@nestjs/common';

import { GameService } from '@/game/game.service';
import { Game as GameModel, User as UserModel, Prisma, Set as SetModel, Game_mode } from '@prisma/client';
import { UserModule } from '@/user/user.module';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/user/user.decorator';
import { get } from 'http';
import { UserService } from '@/user/user.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class GameController {
	constructor(private readonly gameService: GameService, private readonly userService : UserService) { }
	@Get('/games')
	async getGames(): Promise<GameModel[]> {
		return this.gameService.games({});
	}
	@Get('/games/:id')
	async getGame(@Param('id') id: string): Promise<GameModel> {
		return this.gameService.game({ game_id: id });
	}
	@Get('/:login/games')
	async getGamesByLogin(@Param('login') login: string): Promise<GameModel[]> {
		return this.gameService.games({
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
	// @Get('/leaderboard/:page')
	// async getLeaderboardPage(@Param('page') page: number): Promise<UserModel[]> {
	// 	if (Number(page) == NaN)
	// 		throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
	// 	if (Number(page) * 20 > (await this.userService.users({})).length)
	// 		throw new HttpException('Page Not Found', HttpStatus.NOT_FOUND);
	// 	return this.userService.users({ orderBy: { KDA: 'desc' }, take: 20, skip: page * 20 });
	// }
	@Get(['leaderboard', 'leaderboard/:page'])
	async getLeaderboardPage(@Param('page') page: number): Promise<UserModel[]> {
		if (page && Number(page) == NaN)
			throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
		if (page && Number(page) * 20 > (await this.userService.users({})).length)
			throw new HttpException('Page Not Found', HttpStatus.NOT_FOUND);
		page = page ?? 0;
		return await this.gameService.leaderboard(page);
	}
	@Get('/:login/:mode/stats')
	async getStats(@Param()  params: {login: string, mode: string}) {
		params.mode = params.mode.toUpperCase()
		if (params.mode == "RANKED" || params.mode == "NORMAL" || params.mode == "ONE") {
			return await this.gameService.stats(params.login, params.mode);
		}
		else
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
	}
	@Get('/:login/sets')
	async getSets(@Param('login') login: string): Promise<SetModel[]> {
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
			}
		});
	}

	//   @Get('deleteGames')
	//   async deleteAllGames()
	//   {
	// 	return this.gameService.deleteGames();
	//   }
}
