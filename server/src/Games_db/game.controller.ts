import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Put,
	Delete,
  } from '@nestjs/common';

import { GameService } from './game.service';
import { Game as GameModel, User as UserModel, Prisma} from '@prisma/client';
import { UserModule } from '../Users_db/user.module';

@Controller()
export class GameController {
	constructor(private readonly gameService: GameService) {}
	@Post('game')
	async createGame(
		@Body() gameData: { game_winner_id: number; game_loser_id: number ; game_winner_score: number; game_loser_score: number},
	  ): Promise<GameModel> {
		let data = {};
		data['game_date'] = new Date();
		data['game_winner'] = {
			connect: {
					user_id: Number(gameData['game_winner_id'])
			},
		}
		data['game_loser'] = {
			connect: {
					user_id: Number(gameData['game_loser_id'])
			},
		}
		data['game_loser_score'] = Number(gameData['game_loser_score']);
		data['game_winner_score'] = Number(gameData['game_winner_score']);
		return this.gameService.createGame(data);
	  }

	  @Get('/games')
	  async getGames(): Promise<GameModel[]> {
		  return this.gameService.games({});
	  }
	}