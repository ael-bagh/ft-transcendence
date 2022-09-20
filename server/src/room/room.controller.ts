import {
	Controller,
	Get,
	HttpException,
	HttpStatus,
	Param,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { Room , User, Prisma} from '@prisma/client';
import { RoomService } from '@/room/room.service';
import { CurrentUser } from '@/user/user.decorator';
import { UserModule } from '@/user/user.module';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';


@Controller("rooms")
@UseGuards(JwtAuthGuard)
export class RoomController {
	constructor(private readonly roomService: RoomService) { }

	@Get('')
	async getRooms(): Promise<Room[]> {
		return this.roomService.rooms({});
	}

	@Get("createRoom2")
	async createRoom2(@CurrentUser() user: User): Promise<Room> {
		return this.roomService.createRoom({room_name: "hello", room_creator_login: user.login, room_private: Boolean(false)});
	}

	@Get(':id')
	async getRoom( @CurrentUser() action_perfomer: User, @Param('id') room_id: Prisma.RoomWhereUniqueInput): Promise<Room | null> {
		if (await (this.roomService.roomPermissions(action_perfomer,'viewRoom',null, {room_id: Number(room_id)})) == false)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		return this.roomService.room({ room_id: Number(room_id) });
	}

	@Post("createRoom")
	async createRoom(@CurrentUser() user: User, @Param() params: any): Promise<Room> {
		const { name, is_private }:{name:string,is_private:Boolean} = params;
		return this.roomService.createRoom({room_name: name, room_creator_login: user.login, room_private: Boolean(is_private)});
	}
}