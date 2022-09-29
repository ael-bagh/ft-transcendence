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
import { User as UserModel, Game as GameModel, Status, prisma, Room } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
import { GameService } from '@/game/game.service';
import { timeStamp } from 'console';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RoomService } from '@/room/room.service';
import { CurrentUser } from './user.decorator';
import { HttpService } from '@nestjs/axios';
import { NOTFOUND } from 'dns';
import { MessageBody } from '@nestjs/websockets';

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
		private readonly roomService: RoomService
		) { }

	@Get('me')
	// @UseGuards(JwtAuthGuard)
	async getProfile(@CurrentUser() user: UserModel, @Res() res: Response) {
		console.log(user)
		res.json(user);
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
		return (await this.userService.users({ where: { friend_requests: { some: { login: user.login } } } }));
	}
	@Get('sent_friend_requests')
	async getUserSentFriendRequests(@CurrentUser() user: UserModel): Promise<UserModel[]> {
		return (await this.userService.users({ where: { friend_requests_sent: { some: { login: user.login } } } }));
	}
	@Get('friends')
	async getUserFriends(@CurrentUser() user: UserModel): Promise<UserModel[]> {
		return (await this.userService.users({
			where: {
				friends: {
					some: {
						login: user.login
					}
				}
			}
		}));
	}

	@Get('friend/:friend_login')
	async getFriendBool(@CurrentUser() user: UserModel, @Param('friend_login') friend_login: string): Promise<string> {
		console.log(friend_login);
		if (!this.userService.permissionToDoAction({action_performer: user.login, action_target: friend_login}))
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		if( await this.userService.getFriendBool({
			where: {
				login: user.login,
				friends: {
					some: {
						login: friend_login,
					}
				}
			}
		}) )
			return 'friend';
		if ( await this.userService.getFriendBool({
			where: {
				login: user.login,
				friend_requests_sent: {
					some: {
						login: friend_login,
					}
				}
			}
		}))
			return 'friend_request_sent'
		return 'not_friends'
	}
	@Patch('update')
	async updateUser(@CurrentUser() user: UserModel, @Body() userData: { nickname?: string; password?: string; avatar?: string; two_factor_auth?: string; current_lobby?: string; status?: Status },) {
		let login = user.login;
		user['nickname'] = userData['nickname'] || user['nickname'];
		user['avatar'] = userData['avatar'] || user['avatar'];
		user['two_factor_auth'] = userData['two_factor_auth'] || user['two_factor_auth'];
		user['current_lobby'] = userData['current_lobby'] || user['current_lobby'];
		user['status'] = userData['status'] || user['status'];
		if (userData['is_banned'] != undefined)
			user['is_banned'] = userData['is_banned'];
		this.userService.updateUser({
			where: { login: (login) },
			data: user
		});
		return user;
	}
	@Get(':login')
	async getUserByLogin(@Param('login') login: string): Promise<UserModel> {
		// console.log(!Number(login));
		let user: UserModel | null;
		if (!Number(login)) {
			user = await this.userService.user({ login: login });
		}
		else
			user = await this.userService.user({ user_id: Number(login) });
		if (user == null)
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		return user;
	}

	@Post('search_user')
	searchUser(
		@MessageBody() login: string,
		@CurrentUser() user: UserModel
	) {
		const result = this.userService.searchUsers(login, user)
		return(result);
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
	constructor(private readonly userService: UserService, private readonly gameService: GameService, private readonly roomService: RoomService) { }

	@Get('users')
	async getUsers(): Promise<UserModel[]> {
		return this.userService.users({});
	}

	@Get('/leaderboard/:page')
	async getLeaderboardPage(@Param('page') page: number): Promise<UserModel[]> {
		if (Number(page) == NaN)
			throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
		if (Number(page) * 20 > (await this.userService.users({})).length)
			throw new HttpException('Page Not Found', HttpStatus.NOT_FOUND);
		return this.userService.users({ orderBy: { KDA: 'desc' }, take: 20, skip: page * 20 });
	}

	@Delete('/users/delete')
	async deleteAllUsers() {
		this.gameService.deleteGames();
		// this.roomService.deleteMessages({});
		this.roomService.deleteRooms({});
		this.userService.deleteAllUsers();
	}
}