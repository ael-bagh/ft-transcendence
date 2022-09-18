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
	  @Get('/games')
	  async getGames(): Promise<GameModel[]> {
		  return this.gameService.games({});
	  }
	}