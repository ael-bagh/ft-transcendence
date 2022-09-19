import { Module } from "@nestjs/common";
import { PrismaService } from "@/common/services/prisma.service";
import { GameController } from "@/Games_db/game.controller";
import { GameService } from "@/Games_db/game.service";

@Module({
	imports: [],
	controllers: [GameController],
	providers: [GameService,  PrismaService],
})
export class GameModule {}
