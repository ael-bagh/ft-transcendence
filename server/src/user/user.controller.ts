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
	HttpStatus
  } from '@nestjs/common';

import { UserService } from '@/user/user.service';
import { User as UserModel, Game as GameModel, Status, prisma, Room} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
import { GameService } from '@/game/game.service';
import { timeStamp } from 'console';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RoomService } from '@/room/room.service';
import { CurrentUser } from './user.decorator';
import { HttpService } from '@nestjs/axios';

enum status {
	'OFFLINE' = 0,
	'ONLINE',
	'INGAME'
}

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
	constructor(private readonly userService: UserService, private readonly gameService : GameService, private readonly roomService: RoomService) {}

	@Get('me')
	async getProfile(@CurrentUser() user: UserModel, @Res() res : Response) {
		res.json(user);
	}
	@Get('rooms')
	async getUserRooms(@CurrentUser() user: UserModel, ): Promise<Room[]>
	{
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

	@Get(':login')
	async getUserByLogin(@Param('login') login: string): Promise<UserModel> {
		console.log(!Number(login));
		if (!Number(login)) {
			return this.userService.user({login : login });
		}
		return this.userService.user({ user_id: Number(login)});
	}
	@Get(':login/history')
	async getUserGames(@Param('login') login: string): Promise<GameModel[]> {
		return  (await this.gameService.games({where: 
			{OR: [{game_winner: {login: login}}, {game_loser: {login: login}}]},
			orderBy: {game_date: 'desc'},
		}));
	}
	@Get('friend_requests')
		async getUserFriendRequests(@CurrentUser() user: UserModel): Promise<UserModel[]> {
			return (await this.userService.users({where: {friend_requests: {some: {login: user.login}}}}));
	}
	@Get('sent_friend_requests')
		async getUserSentFriendRequests(@CurrentUser() user: UserModel): Promise<UserModel[]> {
			return (await this.userService.users({where: {friend_requests_sent: {some: {login: user.login}}}}));
	}
	@Get('friends')
	async getUserFriends(@CurrentUser() user: UserModel): Promise<UserModel[]> {
			return (await this.userService.users({where: {friends: {some: {login: user.login}}}}));
	}
	@Patch('update')
	async updateUser(@CurrentUser() user: UserModel, @Body()userData: {nickname?: string; password?: string; avatar?: string; two_factor_auth?: string; current_lobby? : string; status? : Status},)
	{
		let login = user.login;
		user['nickname'] = userData['nickname'] || user['nickname'];
		user['avatar'] = userData['avatar'] || user['avatar'];
		user['two_factor_auth'] = userData['two_factor_auth'] || user['two_factor_auth'];
		user['current_lobby'] = userData['current_lobby'] || user['current_lobby'];
		user['status'] = userData['status'] || user['status'];
		if (userData['is_banned'] != undefined)
			user['is_banned'] = userData['is_banned'];
		this.userService.updateUser({
			where : {login: (login)},
			data : user
		});
		return user;
	}
	@Patch('add_friend')
	async addFriend(@CurrentUser() user: UserModel, @Body()userData: {friend_login: string;})
	{
		let login = user.login;
		let friend_login = userData['friend_login'];
		let friend = await this.userService.user({ login: (friend_login) });
		if (!user || !friend)
			return null;
		this.userService.addfriends(login, friend_login);
		return (await this.userService.user({ login: (user.login) }));
	}
	
	@Post('accept_friend')
	async acceptFriend(@CurrentUser() user: UserModel, @Body()userData: {sender_login: string;})
	{
		let friend_login = userData['sender_login'];
		let friend = await this.userService.user({ login: (friend_login) });
		if (!user || !friend)
			return null;
		await this.userService.addfriends(user.login, friend_login);
		await this.userService.updateUser({
			where : {login: (user.login)},
			data : {
				friend_requests: {
					disconnect: {
						login: friend_login,
					},
				},
			},
		});
		return (await this.userService.user({ login: (user.login) }));
	}
	@Patch('add_friend_request')
	async sendFriendRequest(@CurrentUser() user: UserModel, @Body()userData: { friend_login: string;})
	{
		let login = user.login;
		let friend_login = userData['friend_login'];
		let friend = await this.userService.user({ login: (friend_login) });
		if (!user || !friend)
			return null;
		// if not mutual request
		let mutual = await this.userService.users({
			where:{
				friend_requests: {some: {login: friend_login}},
				login: login
			}
		});
		if (mutual.length == 0)
		{

			await this.userService.updateUser({
				where : {login: (friend_login)},
				data : {
					friend_requests: {
						connect: {
							login: login,
						},
					},
				},
			});
		}
		else
		{
			await this.userService.addfriends(login, friend_login);
			await this.userService.updateUser({
				where : {login: (login)},
				data : {
					friend_requests: {
						disconnect: {
							login: friend_login,
						},
					},
				},
			});
		}
		// else add friends directly here
		return (await this.userService.user({ login: (login) }));
	}
	@Delete('delete_friend_request')
	async deleteFriendRequest(@CurrentUser() user: UserModel,@Body()userData: {friend_login: string;})
	{
		let login = user.login;
		let friend_login = userData['friend_login'];
		let friend = await this.userService.user({ login: (friend_login) });
		if (!user || !friend)
			return null;
	
		await this.userService.updateUser({
			where : {login: (friend_login)},
			data : {
				friend_requests: {
					disconnect: {
						login: login,
					},
				},
			},
		});
		return (await this.userService.user({ login: (login) }));
	}
	@Delete('delete_sent_friend_request')
	async deleteSentFriendRequest(@CurrentUser() user: UserModel, @Body()userData: {friend_login: string;})
	{
		let login = user.login
		let friend_login = userData['friend_login'];
		let friend = await this.userService.user({ login: (friend_login) });
		if (!user || !friend)
		return null;
		await this.userService.updateUser({
			where : {login: (login)},
			data : {
				friend_requests_sent: {
					disconnect: {
						login: login,
					},
				},
			},
		});
		await this.userService.updateUser({
			where : {login: (friend_login)},
			data : {
				friend_requests: {
					disconnect: {
						login: login,
					},
				}
			}
		});

		return (await this.userService.user({ login: (login) }));
	}

	@Delete('delete_friend')
	async deleteFriend(@CurrentUser() user: UserModel, @Body()userData: {friend_login: string;})
	{
		await this.userService.deleteFriends(user.login, userData['friend_login']);
		return (await this.userService.user({ login: (user.login) }));
	}

}

@Controller()
export class UsersController {
	constructor(private readonly userService: UserService, private readonly gameService : GameService) {}
	
	@Get('users')
	async getUsers(): Promise<UserModel[]> {
		return this.userService.users({});
	}

	@Get('/leaderboard')
	async getLeaderboard(@Param('page') page: number): Promise<UserModel[]> {
		if (!Number(page))
			throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
		return this.userService.users({orderBy: {KDA: 'desc'}, take: 20});
	}
	
	@Get('/leaderboard/:page')
	async getLeaderboardPage(@Param('page') page: number): Promise<UserModel[]> {
		if (!Number(page))
			throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
		return this.userService.users({orderBy: {KDA: 'desc'}, take: 20, skip : page * 20});
	}

	@Delete('/users/delete')
	async deleteAllUsers()
	{
		this.userService.deleteAllUsers();
	}
	

}