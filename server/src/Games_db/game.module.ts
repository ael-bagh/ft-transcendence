import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { GameController } from "./game.controller";
import { GameService } from "./game.service";

@Module({
	imports: [],
	controllers: [GameController],
	providers: [GameService,  PrismaService],
})
export class GameModule {}
