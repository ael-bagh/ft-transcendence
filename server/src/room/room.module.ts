import { Module } from "@nestjs/common";
import { PrismaService } from '@/common/services/prisma.service';
import { RoomController } from "@/room/room.controller";
import { RoomService } from "@/room/room.service";
import { ChatGatewayService } from "@/common/services/chat.gateway.service";



@Module({
	imports: [],
	controllers: [RoomController],
	providers: [RoomService, PrismaService],
	exports: [RoomService]
})
export class RoomModule { }