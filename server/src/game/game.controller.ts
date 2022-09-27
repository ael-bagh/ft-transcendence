import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Put,
	Delete,
	UseGuards,
  } from '@nestjs/common';

import { GameService } from '@/game/game.service';
import { Game as GameModel, User as UserModel, Prisma} from '@prisma/client';
import { UserModule } from '@/user/user.module';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class GameController {
	constructor(private readonly gameService: GameService) {}
	  @Get('/games')
	  async getGames(): Promise<GameModel[]> {
		  return this.gameService.games({});
	  }
	  @Get('makegame')
	  async createGame()
	  {
		this.gameService.saveGame({game_winner_login:'arhallab', game_loser_login:'ael-bagh', game_winner_score:8,game_loser_score: 0});
	  }

	}
