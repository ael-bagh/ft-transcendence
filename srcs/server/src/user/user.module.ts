import { Module } from "@nestjs/common"
import { PrismaService } from "@/common/services/prisma.service";
import { UsersController, UserController } from "@/user/user.controller";
import { UserService } from "@/user/user.service";
import { GameService } from "@/game/game.service";
import { RoomService } from "@/room/room.service";
import { NotificationService } from "@/notification/notification.service";
import { AchievementService } from "@/achievement/achievement.service";


@Module({
	  imports: [],
	  controllers: [UsersController, UserController],
	  providers: [
		UserService,
		PrismaService,
		GameService,
		RoomService,
		NotificationService,
		AchievementService
	],
	  exports: [UserService]
})
export class UserModule {}
