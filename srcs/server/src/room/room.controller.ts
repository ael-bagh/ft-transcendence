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
import { Room, User, Prisma, Message } from '@prisma/client';
import { RoomService } from '@/room/room.service';
import { CurrentUser } from '@/user/user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
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
		try {
			return await this.roomService.getMessages();
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return [];
		}
	}

	@Get(":room_id/bannedusers")
	async getBannedUsers(@CurrentUser() user: User, @Param('room_id') room_id: string): Promise<User[]> {
		try {
			if (Number(room_id) == NaN)
				return null;
			if (await (this.roomService.roomPermissions(user.login, 'viewRoom', null, { room_id: Number(room_id) })) == false)
				throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
			return this.roomService.getRoomBannedUsers({ room_id: Number(room_id) });
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return [];
		}
	}

	@Delete(":room_id/removemessages")
	async removeMessages(@CurrentUser() user: User, @Param() params: { room_id: string, message_id: string }): Promise<Room | null> {
		try {
			const { room_id, message_id }: { room_id: string, message_id: string } = params;
			if (Number(room_id) == NaN)
				return null;
			if (await (this.roomService.roomPermissions(user.login, 'deleteMessage', null, { room_id: Number(room_id) }, { message_id: Number(message_id) })) == false)
				throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
			this.roomService.deleteMessage({ message_id: Number(message_id) });
			return this.roomService.room({ room_id: Number(room_id) });
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return null;
		}
	}

	@Patch(":room_id/promoteadmin")
	async addAdmin(@CurrentUser() user: User, @Param() params: { room_id: string }, @Body() body: { user_login: string }): Promise<Room | null> {
		try {
			const { room_id }: { room_id: string } = params;
			const { user_login }: { user_login: string } = body;
			if (Number(room_id) == NaN)
				return null;
			if (await (this.roomService.roomPermissions(user.login, 'addAdmin', { login: user_login }, { room_id: Number(room_id) },)) == false)
				throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
			this.roomService.addAdmin({ room_id: Number(room_id) }, { login: user_login });
			return this.roomService.room({ room_id: Number(room_id) });
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return null;
		}
	}

	@Post(":room_id/join_room")
	async joinRoom(@CurrentUser() user: User, @Param() params: { room_id: string }, @Body() password?: { password: string }): Promise<Room | null> {
		try {
			const { room_id }: { room_id: string } = params;
			if (Number(room_id) == NaN)
				return null;
			if (await (this.roomService.roomPermissions(user.login, 'joinRoom', null, { room_id: Number(room_id) })) == false)
				throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
			try {
				return this.roomService.joinRoom({ room_id: Number(room_id) }, { login: user.login }, password.password);
			}
			catch (error) {
				throw error;
			}
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return null;
		}
	}
	@Delete(":room_id/leaveroom")
	async leaveRoom(@CurrentUser() user: User, @Param('room_id') room_id: string): Promise<Room[]> {
		try {
			if (Number(room_id) == NaN)
				return null;
			const room = await this.roomService.room({ room_id: Number(room_id) });
			if ((await this.roomService.roomUsersCount({ room_id: Number(room_id) })) == 1) {
				await this.roomService.deleteRoom({ room_id: Number(room_id) });
				return [];
			}
			if (room.room_creator_login == user.login) {
				await this.roomService.greedySuccessor({ room_id: Number(room_id) });
			}
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
		catch (e) {
			if (e instanceof HttpException) throw e;
			return [];
		}
	}
	@Patch(":room_id/revokeadmin")
	async removeAdmin(@CurrentUser() user: User, @Param() params: { room_id: string }, @Body() body: { user_login: string }): Promise<Room | null> {
		try {
			const { room_id }: { room_id: string } = params;
			const { user_login }: { user_login: string } = body;
			if (Number(room_id) == NaN)
				return null;
			if (await (this.roomService.roomPermissions(user.login, 'removeAdmin', { login: user_login }, { room_id: Number(room_id) },)) == false)
				throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
			this.roomService.removeAdmin({ room_id: Number(room_id) }, { login: user_login });
			return this.roomService.room({ room_id: Number(room_id) });
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return null;
		}
	}

	@Get('')
	async getRooms(
		@CurrentUser() user: User,
		@Query('page') page: number,
		@Query('segment') segment: string
	): Promise<(Room & { unread_messages_count: number })[]> {
		try {
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
					room_admins: true,
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
			const test = await Promise.all(rooms.map(async room => ({
				...room,
				room_password: undefined,
				unread_messages_count: await this.roomService.unseenMessages(room.room_id, user.login),
			})));
			return (test);
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return [];
		}
	}

	@Get('group_rooms')
	async getGroupRooms(@CurrentUser() user: User): Promise<Room[]> {
		try {
			return await this.roomService.rooms({
				where: {
					room_direct_message: false,
					NOT: [
						{
							room_banned_users: {
								some: {
									login: user.login,
								}
							}
						}
					],
				},
				include: {
					room_users: true,
				}
			})
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return [];
		}
	}

	@Post('create_direct_message/:login')
	async createDirectMessage(
		@CurrentUser() action_performer: User,
		@Param("login") target_login: string,
	): Promise<Number> {
		try {
			const relationShip = await this.userServise.getRelationship(
				action_performer.login,
				target_login
			);
			if (relationShip.is_blocked)
				throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
			let room = await this.roomService.directMessageRoom(
				{
					where: {
						room_direct_message: true,
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
					select: {
						room_id: true,
					}
				}
			)
			if (!room) {
				room = await this.roomService.createRoom({
					room_name: '',
					room_direct_message: true,
					room_password: "",
					room_private: false,
					room_creator_login: action_performer.login,
				}) as Room
				room = await this.roomService.addRoomUser(
					{ room_id: room.room_id },
					{ login: target_login }
				)
			}

			return room.room_id;
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return 0;
		}
	}

	@Post("create_room")
	async createRoom(@CurrentUser() user: User, @Body() { name, is_private, is_direct_message, password }: { name: string, is_private: boolean, is_direct_message: boolean, password?: string }): Promise<Room> {
		try {
			let regex = new RegExp('^__connected_.*|^room_id_.*|^__game_queue.*');
			if (
				regex.test(name)
				|| name.length < 5 || name.length > 25
				|| ((!is_private || is_direct_message) && !!password)
				|| (is_private && (is_direct_message || password.length < 6 || password.length > 50))
			)
				throw new HttpException('Invalid Name', HttpStatus.BAD_REQUEST);
			return await this.roomService.createRoom({ room_name: name, room_creator_login: user.login, room_private: is_private, room_direct_message: is_direct_message, room_password: password }) as Room;
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return null;
		}
	}

	@Get(':room_id')
	async getRoom(@CurrentUser() action_performer: User, @Param('room_id') room_id: string): Promise<Room | null> {
		try {
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
			return room;
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return null;
		}
	}

	@Post(":room_id/see_messages")
	async seeMessages(@CurrentUser() user: User, @Param() params: { room_id: string, user_login: string }): Promise<Room | null> {
		try {
			const { room_id, user_login }: { room_id: string, user_login: string } = params;
			if (Number(room_id) == NaN)
				return null;
			await this.roomService.seemessages(Number(room_id), user.login);
			return this.roomService.room({ room_id: Number(room_id) });
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return null;
		}
	}

	@Delete(":room_id")
	async deleteRoom(@CurrentUser() user: User, @Param('room_id') room_id: string) {
		try {
			if (Number(room_id) == NaN)
				return null;
			if (await (this.roomService.roomPermissions(user.login, 'deleteRoom', null, { room_id: Number(room_id) })) == false)
				throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
			this.roomService.deleteRoom({ room_id: Number(room_id) });
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return null;
		}
	}

	@Patch(":room_id/banuser")
	async banUser(@CurrentUser() user: User, @Param() params: { room_id: string }, @Body() body: { user_login: string }): Promise<Room | null> {
		try {
			const { room_id }: { room_id: string } = params;
			const { user_login }: { user_login: string } = body;
			if (Number(room_id) == NaN)
				return null;
			if (await (this.roomService.roomPermissions(user.login, 'banFromRoom', { login: user_login }, { room_id: Number(room_id) })) == false) {
				throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
			}
			return this.roomService.banFromRoom({ room_id: Number(room_id) }, { login: user_login });
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return null;
		}
	}

	@Patch(":room_id/unbanuser")
	async unbanUser(@CurrentUser() user: User, @Param() params: { room_id: string }, @Body() body: { user_login: string }): Promise<Room | null> {
		try {
			const { room_id }: { room_id: string } = params;
			const { user_login }: { user_login: string } = body;
			if (Number(room_id) == NaN)
				return null;
			if (await (this.roomService.roomPermissions(user.login, 'unbanFromRoom', { login: user_login }, { room_id: Number(room_id) })) == false)
				throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
			return this.roomService.unbanFromRoom({ room_id: Number(room_id) }, { login: user_login });
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return null;
		}
	}

	@Get(":room_id/:user_login/role")
	async isAdmin(@CurrentUser() user: User, @Param() params: { room_id: string, user_login: string }): Promise<string> {
		try {
			if (this.roomService.roomPermissions(user.login, 'viewRoom', null, { room_id: Number(params.room_id) }))
				if (Number(params.room_id) == NaN)
					return null;
			if (params.user_login == (await this.roomService.room({ room_id: Number(params.room_id) })).room_creator_login)
				return "CREATOR";
			if (await this.roomService.isRoomAdmin(Number(params.room_id), params.user_login))
				return "ADMIN";
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return "";
		}
	}
}