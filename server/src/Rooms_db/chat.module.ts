import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { ChatService } from "./chat.service";



@Module({
	imports:[],
	controllers: [],
	providers: [ChatService, PrismaService],
	exports: [ChatService]
})
export class ChatModule {}