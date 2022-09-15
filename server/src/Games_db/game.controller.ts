import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Put,
	Delete,
  } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
  } from '@nestjs/swagger';

import { GameService } from './game.service';
import { Game as GameModel, User as UserModel, Prisma} from '@prisma/client';
import { UserModule } from '../Users_db/user.module';

@Controller()

export class GameController {
	constructor(private readonly gameService: GameService) {}
	  @Get('/games')
	  @ApiOperation({ summary: 'Get finished game data' })
	  async getGames(): Promise<GameModel[]> {
		  return this.gameService.games({});
	  }
	}