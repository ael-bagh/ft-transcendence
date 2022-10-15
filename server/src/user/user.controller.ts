import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Put,
	Delete,
	Patch,
	UseGuards,
	Req,
	Res,
	HttpException,
	HttpStatus,
	Query
} from '@nestjs/common';

import { UserService } from '@/user/user.service';
import { User as UserModel, Game as GameModel, Status, prisma, Room, Achievement } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
import { GameService } from '@/game/game.service';
import { profile, timeStamp } from 'console';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RoomService } from '@/room/room.service';
import { CurrentUser } from './user.decorator';
import { HttpService } from '@nestjs/axios';
import { NOTFOUND } from 'dns';
import { MessageBody } from '@nestjs/websockets';
import { NotificationService } from '@/notification/notification.service';
import { Sleeping } from 'matter-js';
import { AchievementService } from '@/achievement/achievement.service';


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
		
	) { }

	@Get('me')
	// @UseGuards(JwtAuthGuard)
	async getProfile(@CurrentUser() user: UserModel) {
		console.log(new Date(),1,user);
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
		return({
			...user,
			_count:usercount["_count"]
		})
	}

	@Get('rooms')
	async getUserRooms(@CurrentUser() user: UserModel,): Promise<Room[]> {
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
	// @UseGuards(JwtAuthGuard)

	@Get(':nickname/available')
	async checkNickname(@Param('nickname') nickname: string): Promise<boolean> {
		const user = await this.userService.user({ nickname: nickname });
		if (user == null)
			return (true);
		return (false);
	}


	@Get(':login/history')

	async getUserGames(@Param('login') login: string): Promise<GameModel[]> {
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
	@Get('friend_requests')
	async getUserFriendRequests(@CurrentUser() user: UserModel): Promise<UserModel[]> {
		return (await this.userService.userFields(user.login, 'received_requests'));
	}

	@Get('sent_friend_requests')
	async getUserSentFriendRequests(@CurrentUser() user: UserModel): Promise<UserModel[]> {
		return (await this.userService.userFields(user.login, 'sent_requests'));
	}
	@Get('friends')
	async getUserFriends(@CurrentUser() user: UserModel): Promise<UserModel[]> {
		console.log('current user: yihssan');
		return (await this.userService.getUserFriends(user.login));
	}

	@Get('friend/:friend_login')
	async getFriendRelationship(@CurrentUser() user: UserModel, @Param('friend_login') friend_login: string): Promise<{
		is_friend: boolean, is_request_sent: boolean, is_request_received: boolean, is_blocked: boolean
	}> {
		let relationships = this.userService.getRelationship(user.login, friend_login);
		return relationships;

	}
	@Patch('update')
	async updateUser(@CurrentUser() user: UserModel, @Body() userData: { nickname?: string; password?: string; avatar?: string; two_factor_auth?: string; current_lobby?: string; status?: Status },) {
		let login = user.login;
		user['nickname'] = userData['nickname'] || user['nickname'];
		user['avatar'] = userData['avatar'];
		if (userData['two_factor_auth_enabled'])
			user['two_factor_auth_enabled'] = userData['two_factor_auth_enabled'] == 'on' ? true : false;
		user['current_lobby'] = userData['current_lobby'] || user['current_lobby'];
		user['status'] = userData['status'] || user['status'];
		if (userData['is_banned'] != undefined)
			user['is_banned'] = userData['is_banned'];
		console.log(new Date(),user, "updated")

		const verify_duplicate = await this.userService.user({ nickname: user['nickname'] });
		if (verify_duplicate != null && verify_duplicate.login != user.login)
			throw new HttpException('Nickname already taken', HttpStatus.BAD_REQUEST);
		await this.userService.updateUser({
			where: { login: (login) },
			data: user
		});
		const newUserInfo = await this.userService.user({ login: login });
		console.log(new Date(),newUserInfo)
		return newUserInfo;
	}

	@Get('achievements')
	async getAchievements(@CurrentUser() user: UserModel) {
		return(await this.acheivementService.getAchievements(user.login))
	}


	@Get(':login')
	async getUserByLogin(@CurrentUser() user: UserModel, @Param('login') profile_login: string): Promise<UserModel> {
		console.log('stupido', profile_login)
		console.log("whuuuut",user);
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
		else
		{
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
		console.log("oooooo", profile_user)
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

	@Post('search_user')
	searchUser(
		@MessageBody() login: string,
		@CurrentUser() user: UserModel
	) {
		const result = this.userService.searchUsers(login, user)
		return (result);
	}

	@Get("/is_available/:nickname")
	async checkAvailability(@Param("nickname") nickname: string) : Promise<Boolean>
	{
		if(await this.userService.user({nickname : nickname}))
			return false;
		return true;
	}
	@Get(['/friends/some', '/some'])
	async getNothing(@CurrentUser() user: UserModel,@Param("segment") segment: string)
	{
		return [];
	}

	@Get('/some/:segment')
	async getUsersBysegments(@CurrentUser() user: UserModel,@Param("segment") segment: string)
	{
		const friends = await this.userService.getUsersBysegment(user.login, segment);
		return friends;
	}

	@Get('/friends/some/:segment')
	async getFriendsBySegment(@CurrentUser() user: UserModel,@Param("segment") segment: string)
	{
		const friends = await this.userService.getUsersFriendsBySegment(user.login, segment);
		return friends;
	}
	// @Delete('/:id/delete')
	// async deleteUser(@CurrentUser() user: UserModel, @Body() userData: {login: string})
	// {
	// 	const login = userData.login;
	// 	this.userService.user({login: login});
	// 	let rooms = this.roomService.rooms({
	// 		where:{
	// 			room_creator_login: login
	// 		}
	// 	})
	// }
	// @Post('accept_friend')
	// async acceptFriend(@CurrentUser() user: UserModel, @Body()userData: {sender_login: string;})
	// {
	// 	let friend_login = userData['sender_login'];
	// 	let friend = await this.userService.user({ login: (friend_login) });
	// 	if (!user || !friend)
	// 		return null;
	// 	await this.userService.addfriends(user.login, friend_login);
	// 	await this.userService.AcceptFriend({login: user.login, friend_login});
	// 	return (await this.userService.user({ login: (user.login) }));
	// }

	// @Patch('add_friend_request')
	// async sendFriendRequest(@CurrentUser() user: UserModel, @Body()userData: { friend_login: string;})
	// {
	// 	let login = user.login;
	// 	let friend_login = userData['friend_login'];
	// 	return this.userService.sendFriendRequest({login, friend_login});
	// 	// else add friends directly here
	// }
	// @Delete('delete_friend_request')
	// async deleteFriendRequest(@CurrentUser() user: UserModel,@Body()userData: {friend_login: string;})
	// {
	// 	let login = user.login;
	// 	let friend_login = userData['friend_login'];
	// 	let friend = await this.userService.user({ login: (friend_login) });
	// 	if (!user || !friend)
	// 		return null;

	// 	await this.userService.updateUser({
	// 		where : {login: (friend_login)},
	// 		data : {
	// 			friend_requests: {
	// 				disconnect: {
	// 					login: login,
	// 				},
	// 			},
	// 		},
	// 	});
	// 	return (await this.userService.user({ login: (login) }));
	// }
	// @Delete('delete_sent_friend_request')
	// async deleteSentFriendRequest(@CurrentUser() user: UserModel, @Body()userData: {friend_login: string;})
	// {
	// 	let login = user.login
	// 	let friend_login = userData['friend_login'];
	// 	let friend = await this.userService.user({ login: (friend_login) });
	// 	if (!user || !friend)
	// 	return null;
	// 	await this.userService.updateUser({
	// 		where : {login: (login)},
	// 		data : {
	// 			friend_requests_sent: {
	// 				disconnect: {
	// 					login: login,
	// 				},
	// 			},
	// 		},
	// 	});
	// 	await this.userService.updateUser({
	// 		where : {login: (friend_login)},
	// 		data : {
	// 			friend_requests: {
	// 				disconnect: {
	// 					login: login,
	// 				},
	// 			}
	// 		}
	// 	});

	// 	return (await this.userService.user({ login: (login) }));
	// }

	// @Delete('delete_friend')
	// async deleteFriend(@CurrentUser() user: UserModel, @Body()userData: {friend_login: string;})
	// {
	// 	await this.userService.deleteFriends(user.login, userData['friend_login']);
	// 	return (await this.userService.user({ login: (user.login) }));
	// }

}

@Controller()
export class UsersController {
	constructor(
		private readonly userService: UserService,
		private readonly gameService: GameService,
		private readonly roomService: RoomService,
		private readonly notificationService : NotificationService,
		) { }

	@Get('users')
	async getUsers(): Promise<UserModel[]> {
		return this.userService.users({});
	}

}