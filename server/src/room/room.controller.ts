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
import { Room, User, Prisma, Message_Notification, Message } from '@prisma/client';
import { RoomService } from '@/room/room.service';
import { CurrentUser } from '@/user/user.decorator';
import { UserModule } from '@/user/user.module';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { userInfo } from 'os';
import { UserService } from '@/user/user.service';
import { WsException } from '@nestjs/websockets';


@Controller("rooms")
@UseGuards(JwtAuthGuard)
export class RoomController {
	constructor(
		private readonly roomService: RoomService,
		private readonly userServise: UserService,
		) { }

	@Get('messages')
	async getAllMessages(): Promise<Message[]> {
		return await this.roomService.getMessages();
	}

	@Get('')
	async getRooms(
		@CurrentUser() user: User,
		@Query('page') page: number,
		@Query('segment') segment: string
		): Promise<(Room & { unread_messages_count: number })[]> {
		page = Number(page) || 0;

		const whereClause: Prisma.RoomWhereInput = {
			room_users: {
				some: {
					login: user.login
				}
			},
		};

		if (segment) {
			whereClause['OR'] = [
				{
					room_name: {
						contains: segment
					},
				},
				{
					room_users: {
						some: {
							login: {
								contains: segment,
								not: user.login
							},
						},
					}
				}
			]
		}

		const rooms = await this.roomService.rooms({
			where: whereClause,
			include: {
				room_users: true,
				room_messages:
				{
					take: 1,
					orderBy: {
						message_time: 'desc'
					}
				},

			},
			take: 10,
			skip: 10 * page,
		});
		// await Promise.all(rooms.map(async room => {
		// 	delete room.room_password;
		// }));
		const test =  await Promise.all(rooms.map(async room => ({
			...room,
			room_password : undefined,
			unread_messages_count: await this.roomService.unseenMessages(room.room_id, user.login),
		})));
		console.log(test);
		return(test);
	}

	// @Get("create_room2")
	// async createRoom2(@CurrentUser() user: User): Promise<Room> {
	// 	return this.roomService.createRoom({ room_name: "hello", room_creator_login: user.login, room_private: Boolean(false) });
	// }

	@Get(':room_id')
	async getRoom(@CurrentUser() action_performer: User, @Param('room_id') room_id: string): Promise<Room | null> {
		if (Number(room_id) == NaN)
			return null;
		if (await (this.roomService.roomPermissions(action_performer.login, 'viewRoom', null, { room_id: Number(room_id) })) == false)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		let room = await this.roomService.room({ room_id: Number(room_id) });
		if (room.room_direct_message) {
			const room_users = await this.roomService.getRoomUsers({ room_id: Number(room_id) });
			room.room_name = (action_performer.login == room_users[0].login ? room_users[1].login : room_users[0].login)
		}
		delete (room).room_password;
		console.log(room);
		return room;
	}

	@Post('create_direct_message/:login')
	async createDirectMessage(
		@CurrentUser() action_performer: User,
		@Param("login") target_login: string,
	): Promise<Number> {
		const relationShip = await this.userServise.getRelationship(
			action_performer.login,
			target_login
			);
		if (relationShip.is_blocked)
			throw new WsException('Not Found')
		let room = await this.roomService.directMessageRoom(
			{
				where: {
					room_direct_message : true,
					AND: [
						{
							room_users: {
								some: action_performer
							}
						},
						{
							room_users: {
								some: {
									login: target_login
								},
							}
						}
					]
				},
				select:{
					room_id:true,
				}
			}
		)
		console.log(room, !room);
		if (!room)
		{
			room = await this.roomService.createRoom({
				room_name : '',
				room_direct_message : true,
				room_password: "",
				room_private: false,
				room_creator_login: action_performer.login,
			}) as Room
			room = await this.roomService.addRoomUser(
				{room_id: room.room_id},
				{login: target_login}
				)
		}

		return room.room_id;
	}


	@Post("create_room")
	async createRoom(@CurrentUser() user: User, @Body() { name, is_private, is_direct_message, password }: { name: string, is_private: boolean, is_direct_message: boolean, password?: string }) {
		let regex = new RegExp('^__connected_.*');
		if (regex.test(name))
			throw new HttpException('Invalid Name', HttpStatus.BAD_REQUEST);
		return this.roomService.createRoom({ room_name: name, room_creator_login: user.login, room_private: is_private, room_direct_message: is_direct_message, room_password: password });
	}

	@Post(":room_id/see_messages")
	async seeMessages(@CurrentUser() user: User, @Param() params: { room_id: string, user_login: string }): Promise<Room | null> {
		const { room_id, user_login }: { room_id: string, user_login: string } = params;
		if (Number(room_id) == NaN)
			return null;
		await this.roomService.seemessages(Number(room_id), user.login);
		return this.roomService.room({ room_id: Number(room_id) });
	}

	@Delete(":room_id")
	async deleteRoom(@CurrentUser() user: User, @Param('room_id') room_id: string) {
		if (Number(room_id) == NaN)
			return null;
		if (await (this.roomService.roomPermissions(user.login, 'deleteRoom', null, { room_id: Number(room_id) })) == false)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		this.roomService.deleteRoom({ room_id: Number(room_id) });
	}

	@Post(":room_id/join_room")
	async joinRoom(@CurrentUser() user: User, @Param() params: { room_id: string }, @Body() password?: { password: string }): Promise<Room | null> {
		const { room_id }: { room_id: string } = params;
		if (Number(room_id) == NaN)
			return null;
		if (await (this.roomService.roomPermissions(user.login, 'joinRoom', null, { room_id: Number(room_id) })) == false)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		if (password.password)
			return this.roomService.joinRoom({ room_id: Number(room_id) }, { login: user.login }, password.password);
		else
			return this.roomService.joinRoom({ room_id: Number(room_id) }, { login: user.login });
	}
	@Delete(":room_id/leave_room")
	async leaveRoom(@CurrentUser() user: User, @Param('room_id') room_id: string): Promise<Room[]> {
		if (Number(room_id) == NaN)
			return null;
		this.roomService.leaveRoom({ room_id: Number(room_id) }, { login: user.login });
		return this.roomService.rooms({
			where: {
				room_users: {
					some: {
						login: user.login
					}

				},
			}
		});
	}

	@Patch(":room_id/:user_login/ban_user")
	async banUser(@CurrentUser() user: User, @Param() params: { room_id: string, user_login: string }): Promise<Room | null> {
		const { room_id, user_login }: { room_id: string, user_login: string } = params;
		if (Number(room_id) == NaN)
			return null;
		if (await (this.roomService.roomPermissions(user.login, 'banFromRoom', { login: user_login }, { room_id: Number(room_id) })) == false)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		return this.roomService.banFromRoom({ room_id: Number(room_id) }, { login: user_login });
	}

	@Patch(":room_id/:user_login/unban_user")
	async unbanUser(@CurrentUser() user: User, @Param() params: { room_id: string, user_login: string }): Promise<Room | null> {
		const { room_id, user_login }: { room_id: string, user_login: string } = params;
		if (Number(room_id) == NaN)
			return null;
		if (await (this.roomService.roomPermissions(user.login, 'unbanFromRoom', { login: user_login }, { room_id: Number(room_id) })) == false)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		return this.roomService.unbanFromRoom({ room_id: Number(room_id) }, { login: user_login });
	}

	@Get(":room_id/banned_users")
	async getBannedUsers(@CurrentUser() user: User, @Param('room_id') room_id: string): Promise<User[]> {
		if (Number(room_id) == NaN)
			return null;
		if (await (this.roomService.roomPermissions(user.login, 'viewRoom', null, { room_id: Number(room_id) })) == false)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		return this.roomService.getRoomBannedUsers({ room_id: Number(room_id) });
	}

	// @Post(":room_id/addMessage")
	// async addMessage(@CurrentUser() user: User, @Param() params: { room_id: string }): Promise<Room | null> {
	// 	let message = "hello from the other side";
	// 	const { room_id }: { room_id: string } = params;
	// 	if (Number(room_id) == NaN)
	// 		return null;
	// 	if (await (this.roomService.roomPermissions(user.login, 'viewRoom', null, { room_id: Number(room_id) },)) == false)
	// 		throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	// 	this.roomService.addMessage(message, user.login, Number(room_id));
	// 	return this.roomService.room({ room_id: Number(room_id) });
	// }

	@Delete(":room_id/removemessages")
	async removeMessages(@CurrentUser() user: User, @Param() params: { room_id: string, message_id: string }): Promise<Room | null> {
		const { room_id, message_id }: { room_id: string, message_id: string } = params;
		if (Number(room_id) == NaN)
			return null;
		if (await (this.roomService.roomPermissions(user.login, 'deleteMessage', null, { room_id: Number(room_id) }, { message_id: Number(message_id) })) == false)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		this.roomService.deleteMessage({ message_id: Number(message_id) });
		return this.roomService.room({ room_id: Number(room_id) });
	}

	@Patch(":room_id/addadmin")
	async addAdmin(@CurrentUser() user: User, @Param() params: { room_id: string, user_login: string }): Promise<Room | null> {
		const { room_id, user_login }: { room_id: string, user_login: string } = params;
		if (Number(room_id) == NaN)
			return null;
		if (await (this.roomService.roomPermissions(user.login, 'addAdmin', { login: user_login }, { room_id: Number(room_id) },)) == false)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		this.roomService.addAdmin({ room_id: Number(room_id) }, { login: user_login });
		return this.roomService.room({ room_id: Number(room_id) });
	}

	@Patch(":room_id/removeadmin")
	async removeAdmin(@CurrentUser() user: User, @Param() params: { room_id: string, user_login: string }): Promise<Room | null> {
		const { room_id, user_login }: { room_id: string, user_login: string } = params;
		if (Number(room_id) == NaN)
			return null;
		if (await (this.roomService.roomPermissions(user.login, 'removeAdmin', { login: user_login }, { room_id: Number(room_id) },)) == false)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		this.roomService.removeAdmin({ room_id: Number(room_id) }, { login: user_login });
		return this.roomService.room({ room_id: Number(room_id) });
	}

	
	// @SubscribeMessage('search_rooms')
	// searchForRoom(@MessageBody() segment: string, @ConnectedSocket() client: CustomSocket) {
	// 	/// prisma.rooms.find(name contains query)
	// 	const result = this.prisma.room.findMany({
	// 		where: {
	// 			room_name: {
	// 				contains: segment,
	// 			}
	// 		}
	// 	})
	// 	client.emit('found_rooms', result);

	// }

}