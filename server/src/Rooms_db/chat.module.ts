import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { ChatService } from "./chat.service";



@Module({
	imports:[],
	controllers: [],
	providers: [ChatService, PrismaService],
})
export class ChatModule {}