import { Module } from "@nestjs/common";
import { PrismaService } from '@/common/services/prisma.service';
import { ChatController } from "@/Rooms_db/chat.controller";
import { ChatService } from "@/Rooms_db/chat.service";



@Module({
	imports:[],
	controllers: [ChatController],
	providers: [ChatService, PrismaService],
	exports: [ChatService]
})
export class ChatModule {}