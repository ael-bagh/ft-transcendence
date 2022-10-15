import { Module } from "@nestjs/common";
import { PrismaService } from '@/common/services/prisma.service';
import { RoomController } from "@/room/room.controller";
import { RoomService } from "@/room/room.service";
import { UserService } from "@/user/user.service";



@Module({
	imports: [],
	controllers: [RoomController],
	providers: [RoomService, PrismaService, UserService],
	exports: [RoomService]
})
export class RoomModule { }