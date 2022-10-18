import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Patch,
	UseGuards,
	HttpException,
	HttpStatus,
} from '@nestjs/common';

import { UserService } from '@/user/user.service';
import { User as UserModel, Game as GameModel, Status, Room } from '@prisma/client';
import { GameService } from '@/game/game.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RoomService } from '@/room/room.service';
import { CurrentUser } from './user.decorator';
import { MessageBody } from '@nestjs/websockets';
import { NotificationService } from '@/notification/notification.service';
import { AchievementService } from '@/achievement/achievement.service';
import { CloudinaryService } from '@/common/services/cloudinary.service';


enum status {
	'OFFLINE' = 0,
	'ONLINE',
	'INGAME'
}

function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}


@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly gameService: GameService,
		private readonly roomService: RoomService,
		private readonly acheivementService: AchievementService,
		private readonly cloudinaryService: CloudinaryService,
	) { }


	@Get('me')
	// @UseGuards(JwtAuthGuard)
	async getProfile(@CurrentUser() user: UserModel) {
		try {
			const usercount = await this.userService.user({ login: user.login },
				{
					_count: {
						select: {
							games_lost: true,
							games_won: true,
							friend_requests: true,
							friends: true,
						}

					}
				}
			)
			return ({
				...user,
				_count: usercount["_count"]
			})
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return null;
		}
	}

	@Get('rooms')
	async getUserRooms(@CurrentUser() user: UserModel,): Promise<Room[]> {
		try {
			return (await this.roomService.rooms({
				where:
				{
					room_users:
					{
						some:
						{
							login: user.login,
						}
					}
				}
			}));
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return [];
		}
	}
	// @UseGuards(JwtAuthGuard)

	@Get(':nickname/available')
	async checkNickname(@Param('nickname') nickname: string): Promise<boolean> {
		try {
			const user = await this.userService.user({ nickname: nickname });
			if (user == null)
				return (true);
			return (false);
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return null;
		}
	}


	@Get(':login/history')

	async getUserGames(@Param('login') login: string): Promise<GameModel[]> {
		try {
			let user: UserModel | null
			if (!Number(login)) {
				user = await this.userService.user({ login: login });
			}
			else
				user = await this.userService.user({ user_id: Number(login) });
			if (user == null)
				throw new HttpException('Not found', HttpStatus.NOT_FOUND);
			const games = (await this.gameService.games({
				where:
					{ OR: [{ game_winner: { login: user.login } }, { game_loser: { login: user.login } }] },
				orderBy: { game_date: 'desc' },
				include: {
					game_winner: {
						select: {
							login: true,
							nickname: true,
							avatar: true,
						}
					},
					game_loser: {
						select: {
							login: true,
							nickname: true,
							avatar: true,
						}
					}
				},
			}));
			return games;
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return [];
		}
	}
	@Get('friend_requests')
	async getUserFriendRequests(@CurrentUser() user: UserModel): Promise<UserModel[]> {
		try {
			return (await this.userService.userFields(user.login, 'received_requests'));
		}
		catch (e) {
			return [];
		}
	}

	@Get('sent_friend_requests')
	async getUserSentFriendRequests(@CurrentUser() user: UserModel): Promise<UserModel[]> {
		try {
			return (await this.userService.userFields(user.login, 'sent_requests'));
		}
		catch (e) {
			return [];
		}
	}
	@Get('friends')
	async getUserFriends(@CurrentUser() user: UserModel): Promise<UserModel[]> {
		try {
			return (await this.userService.getUserFriends(user.login));
		}
		catch (e) {
			return [];
		}
	}

	@Get('friend/:friend_login')
	async getFriendRelationship(@CurrentUser() user: UserModel, @Param('friend_login') friend_login: string): Promise<{
		is_friend: boolean, is_request_sent: boolean, is_request_received: boolean, is_blocked: boolean
	}> {
		try {
			let relationships = await this.userService.getRelationship(user.login, friend_login);
			return relationships;
		}
		catch (e) {
			return null;
		}

	}
	@Patch('update')
	async updateUser(@CurrentUser() user: UserModel, @Body() userData: { nickname?: string; password?: string; avatar?: string; two_factor_auth?: string; current_lobby?: string; status?: Status },) {
		let login = user.login;
		user['nickname'] = userData['nickname'] || user['nickname'];
		if (userData['avatar'])
			user['avatar'] = await this.cloudinaryService.uploadImage(userData['avatar'], login);
		if (userData['two_factor_auth_enabled'])
			user['two_factor_auth_enabled'] = userData['two_factor_auth_enabled'] == 'on' ? true : false;
		user['current_lobby'] = userData['current_lobby'] || user['current_lobby'];
		user['status'] = userData['status'] || user['status'];
		if (userData['is_banned'] != undefined)
			user['is_banned'] = userData['is_banned'];
		try {
			const verify_duplicate = await this.userService.user({ nickname: user['nickname'] });
			if (user.nickname.length > 25 || user.nickname.length < 5)
				throw new HttpException('Nickname not valid', HttpStatus.BAD_REQUEST);
			if (verify_duplicate != null && verify_duplicate.login != user.login)
				throw new HttpException('Nickname already taken', HttpStatus.BAD_REQUEST);
			await this.userService.updateUser({
				where: { login: (login) },
				data: user
			});
			const newUserInfo = await this.userService.user({ login: login });
			return newUserInfo;
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return null;
		}
	}

	@Get('achievements')
	async getAchievements(@CurrentUser() user: UserModel) {
		try {
			return (await this.acheivementService.getAchievements(user.login))
		}
		catch (e) {
			return null;
		}
	}


	@Get(':login')
	async getUserByLogin(@CurrentUser() user: UserModel, @Param('login') profile_login: string): Promise<UserModel> {
		try {
			if (profile_login == 'me')
				return user;
			let profile_user: UserModel | null;
			if (!Number(profile_login)) {
				if (user.login == profile_login)
					return user;
				profile_user = await this.userService.user({ login: profile_login, },
					{
						_count: {
							select: {
								games_lost: true,
								games_won: true,
								friend_requests: true,
								friends: true,
							}

						}
					}
				);
			}
			else {
				if (user.user_id == Number(profile_login))
					return user;
				profile_user = await this.userService.user({ user_id: Number(profile_login) },
					{
						_count: {
							select: {
								games_lost: true,
								games_won: true,
								friend_requests: true,
								friends: true,
							}

						}
					}
				);
			}
			if (profile_user == null)
				throw new HttpException('Not found', HttpStatus.NOT_FOUND);
			let allowed = await this.userService.permissionToDoAction({
				action_performer: user.login,
				action_target: profile_user.login,
				action_mutual: false
			});
			if (!allowed)
				throw new HttpException('Not found', HttpStatus.NOT_FOUND);
			if (user == null)
				throw new HttpException('Not found', HttpStatus.NOT_FOUND);
			return profile_user;
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return null;
		}
	}

	@Post('search_user')
	searchUser(
		@MessageBody() login: string,
		@CurrentUser() user: UserModel
	) {
		try {
			const result = this.userService.searchUsers(login, user)
			return (result);
		}
		catch (e) {
			return [];
		}
	}

	@Get("/is_available/:nickname")
	async checkAvailability(@Param("nickname") nickname: string): Promise<Boolean> {
		try {
			if (await this.userService.user({ nickname: nickname }))
				return false;
			return true;
		}
		catch (e) {
			return false;
		}
	}
	@Get(['/friends/some', '/some'])
	async getNothing(@CurrentUser() user: UserModel, @Param("segment") segment: string) {
		return [];
	}

	@Get('/some/:segment')
	async getUsersBysegments(@CurrentUser() user: UserModel, @Param("segment") segment: string) {
		try {
			const friends = await this.userService.getUsersBysegment(user.login, segment);
			return friends;
		}
		catch (e) {
			return [];
		}
	}

	@Get('/friends/some/:segment')
	async getFriendsBySegment(@CurrentUser() user: UserModel, @Param("segment") segment: string) {
		try {
			const friends = await this.userService.getUsersFriendsBySegment(user.login, segment);
			return friends;
		}
		catch (e) {
			return [];
		}

	}
}

@Controller()
export class UsersController {
	constructor(
		private readonly userService: UserService,
		private readonly gameService: GameService,
		private readonly roomService: RoomService,
		private readonly notificationService: NotificationService,
	) { }

	@Get('users')
	async getUsers(): Promise<UserModel[]> {
		return this.userService.users({});
	}

}