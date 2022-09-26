import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	HttpStatus,
	Param,
	Patch,
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
	async getRooms(@CurrentUser() user: User): Promise<Room[]> {
		return this.roomService.rooms({
			where:{
				room_users:{
					some:{
						login: user.login
					}
				},
		},
		include:{
			room_messages:{
				take: 1,
				orderBy:{
					message_time: 'desc';
				}
			}
		}
	});
	}

	@Get("create_room2")
	async createRoom2(@CurrentUser() user: User): Promise<Room> {
		return this.roomService.createRoom({room_name: "hello", room_creator_login: user.login, room_private: Boolean(false)});
	}

	@Get(':room_id')
	async getRoom( @CurrentUser() action_perfomer: User, @Param('room_id') room_id: string): Promise<Room | null> {
		if (Number(room_id) == NaN)
			return null;
		if (await (this.roomService.roomPermissions(action_perfomer.login,'viewRoom',null, {room_id: Number(room_id)})) == false)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		return this.roomService.room({ room_id: Number(room_id) });
	}


	@Post("create_room")
	async createRoom(@CurrentUser() user: User, @Param() params: {name: string, is_private: string}): Promise<Room> {
		const { name, is_private }:{name:string,is_private:string} = params;
		let regex = new RegExp('^__connected_.*');
		if (regex.test(name))
			throw new HttpException('Invalid Name', HttpStatus.BAD_REQUEST);
		return this.roomService.createRoom({room_name: name, room_creator_login: user.login, room_private: Boolean(is_private)});
	}

	@Delete(":room_id")
	async deleteRoom(@CurrentUser() user: User, @Param('room_id') room_id: string): Promise<Room | null> {
		if (Number(room_id) == NaN)
			return null;
		if (await (this.roomService.roomPermissions(user.login,'deleteRoom',null, {room_id: Number(room_id)})) == false)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		return this.roomService.deleteRoom({room_id: Number(room_id)});
	}

	@Get(":room_id/join_room")
	async joinRoom(@CurrentUser() user: User, @Param() params: {room_id: string}, @Body() password?:{password:string} ): Promise<Room | null> {
		const { room_id }:{room_id:string} = params;
		if (Number(room_id) == NaN)
			return null;
		if (await (this.roomService.roomPermissions(user.login,'joinRoom',null, {room_id: Number(room_id)})) == false)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		if (password.password)
			return this.roomService.joinRoom({room_id: Number(room_id)}, {login: user.login}, password.password);
		else
			return this.roomService.joinRoom({room_id: Number(room_id)}, {login: user.login});
	}
	@Get(":room_id/leave_room")
	async leaveRoom(@CurrentUser() user: User, @Param('room_id') room_id: string): Promise<Room[]> {
		if (Number(room_id) == NaN)
			return null;
		this.roomService.leaveRoom({room_id: Number(room_id)}, {login: user.login});
		return this.roomService.rooms({
			where:{
				room_users:{
					some:{
						login: user.login
					}

				},
		}
	});
	}

	@Get(":room_id/:user_login/ban_user")
	async banUser(@CurrentUser() user: User, @Param() params: {room_id: string, user_login: string}): Promise<Room | null> {
		const { room_id, user_login }:{room_id:string,user_login:string} = params;
		if (Number(room_id) == NaN)
			return null;
		if (await (this.roomService.roomPermissions(user.login,'banFromRoom',{login: user_login}, {room_id: Number(room_id)})) == false)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		return this.roomService.banFromRoom({room_id: Number(room_id)}, {login: user_login});
	}

	@Get(":room_id/:user_login/unban_user")
	async unbanUser(@CurrentUser() user: User, @Param() params: {room_id: string, user_login: string}): Promise<Room | null> {
		const { room_id, user_login }:{room_id:string,user_login:string} = params;
		if (Number(room_id) == NaN)
			return null;
		if (await (this.roomService.roomPermissions(user.login,'unbanFromRoom',{login: user_login}, {room_id: Number(room_id)})) == false)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		return this.roomService.unbanFromRoom({room_id: Number(room_id)}, {login: user_login});
	}

	@Get(":room_id/banned_users")
	async getBannedUsers(@CurrentUser() user: User, @Param('room_id') room_id: string): Promise<User[]> {
		if (Number(room_id) == NaN)
			return null;
		if (await (this.roomService.roomPermissions(user.login,'viewRoom',null, {room_id: Number(room_id)})) == false)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		return this.roomService.getRoomBannedUsers({room_id: Number(room_id)});
	}

	@Get(":room_id/addMessage")
	async addMessage(@CurrentUser() user: User, @Param() params: {room_id: string}): Promise<Room | null> {
		let message = "hello from the other side";
		const { room_id }:{room_id:string} = params;
		if (Number(room_id) == NaN)
			return null;
		if (await (this.roomService.roomPermissions(user.login,'viewRoom',null, {room_id: Number(room_id)},)) == false)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		this.roomService.addMessage(message, user.user_id, Number(room_id));
		return this.roomService.room({room_id: Number(room_id)});
	}
	
	@Get(":room_id/removemessages")
	async removeMessages(@CurrentUser() user: User, @Param() params: {room_id: string, message_id: string}): Promise<Room | null> {
		const { room_id, message_id }:{room_id:string, message_id:string} = params;
		if (Number(room_id) == NaN)
			return null;
		if (await (this.roomService.roomPermissions(user.login,'deleteMessage',null, {room_id: Number(room_id)}, {message_id: Number(message_id)})) == false)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		this.roomService.deleteMessage({message_id: Number(message_id)});
		return this.roomService.room({room_id: Number(room_id)});
	}

	@Get(":room_id/addadmin")
	async addAdmin(@CurrentUser() user: User, @Param() params: {room_id: string, user_login: string}): Promise<Room | null> {
		const { room_id, user_login }:{room_id:string, user_login:string} = params;
		if (Number(room_id) == NaN)
			return null;
		if (await (this.roomService.roomPermissions(user.login,'addAdmin',{login: user_login}, {room_id: Number(room_id)}, )) == false)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		this.roomService.addAdmin({room_id: Number(room_id)}, {login: user_login});
		return this.roomService.room({room_id: Number(room_id)});
	}

	@Get(":room_id/removeadmin")
	async removeAdmin(@CurrentUser() user: User, @Param() params: {room_id: string, user_login: string}): Promise<Room | null> {
		const { room_id, user_login }:{room_id:string, user_login:string} = params;
		if (Number(room_id) == NaN)
			return null;
		if (await (this.roomService.roomPermissions(user.login,'removeAdmin',{login: user_login}, {room_id: Number(room_id)}, )) == false)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		this.roomService.removeAdmin({room_id: Number(room_id)}, {login: user_login});
		return this.roomService.room({room_id: Number(room_id)});
	}
	
}