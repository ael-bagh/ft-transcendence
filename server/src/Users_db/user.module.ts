import { Module } from "@nestjs/common"
import { PrismaService } from "@/common/services/prisma.service";
import { UsersController, UserController } from "@/Users_db/user.controller";
import { UserService } from "@/Users_db/user.service";
import { GameService } from "@/Games_db/game.service";


@Module({
	  imports: [],
	  controllers: [UsersController, UserController],
	  providers: [UserService, PrismaService, GameService],
	  exports: [UserService]
})
export class UserModule {}
