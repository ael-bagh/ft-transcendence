import { Module } from "@nestjs/common"
import { PrismaService } from "@/common/services/prisma.service";
import { UsersController, UserController } from "@/user/user.controller";
import { UserService } from "@/user/user.service";
import { GameService } from "@/game/game.service";
import { RoomService } from "@/room/room.service";
import { AchievementService } from "./achievement.service";
import { AchievementController } from "./achievement.controller";


@Module({
	  imports: [],
	  controllers: [AchievementController],
	  providers: [UserService, PrismaService, GameService, RoomService, AchievementService],
	  exports: [AchievementService]
})
export class AchievementModule {}