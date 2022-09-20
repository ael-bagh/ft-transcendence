import { Module } from "@nestjs/common";
import { PrismaService } from '@/common/services/prisma.service';
import { RoomController } from "@/room/room.controller";
import { RoomService } from "@/room/room.service";



@Module({
	imports:[],
	controllers: [RoomController],
	providers: [RoomService, PrismaService],
	exports: [RoomService]
})
export class RoomModule {}