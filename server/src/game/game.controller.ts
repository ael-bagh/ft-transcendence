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
import { Game as GameModel, User as UserModel, Prisma } from '@prisma/client';
import { UserModule } from '@/user/user.module';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import JwtTwoFactorGuard  from '@/common/guards/jwt-two-factor.guard';
import { CurrentUser } from '@/user/user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
@UseGuards(JwtTwoFactorGuard)
export class GameController {
  constructor(private readonly gameService: GameService) {}
  @Get('/games')
  async getGames(): Promise<GameModel[]> {
    return this.gameService.games({});
  }
  @Get('/games/:id')
  async getGame(@Param('id') id: string): Promise<GameModel> {
    return this.gameService.game({ game_id: id });
  }
}
