import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";



@Module({
	imports:[],
	controllers: [ChatController],
	providers: [ChatService, PrismaService],
	exports: [ChatService]
})
export class ChatModule {}