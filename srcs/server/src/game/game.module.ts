import { Module } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';
import { GameController } from '@/game/game.controller';
import { GameService } from '@/game/game.service';
import { UserService } from '@/user/user.service';

@Module({
  imports: [],
  controllers: [GameController],
  providers: [GameService, PrismaService, UserService],
  exports: [GameService],
})
export class GameModule {}
