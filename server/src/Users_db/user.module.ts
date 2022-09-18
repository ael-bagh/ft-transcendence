import { Module } from "@nestjs/common"
import { PrismaService } from "../prisma.service";
import { UsersController, UserController } from "./user.controller";
import { UserService } from "./user.service";
import { GameService } from "../Games_db/game.service";


@Module({
	  imports: [],
	  controllers: [UsersController, UserController],
	  providers: [UserService, PrismaService, GameService],
	  exports: [UserService]
})
export class UserModule {}
