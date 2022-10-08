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

@Controller()
@UseGuards(JwtAuthGuard)
export class GameController {
	constructor(private readonly gameService: GameService) { }
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

	@Get('/:login/:mode/stats')
	async getStats(@Param()  params: {login: string, mode: string}) {
		params.mode = params.mode.toUpperCase()
		if (params.mode == "RANKED" || params.mode == "NORMAL" || params.mode == "ONE") {
			return this.gameService.stats(params.login, params.mode);
		}
		else
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
	}
	@Get('/:login/sets')
	async getSets(@Param('login') login: string): Promise<SetModel[]> {
		return this.gameService.sets({
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
