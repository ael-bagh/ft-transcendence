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
	Res
  } from '@nestjs/common';

import { UserService } from '@/Users_db/user.service';
import { User as UserModel, Game as GameModel, Status, prisma} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
import { GameService } from '@/Games_db/game.service';
import { timeStamp } from 'console';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

enum status {
	'OFFLINE' = 0,
	'ONLINE',
	'INGAME'
}

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService, private readonly gameService : GameService) {}
	
	@UseGuards(JwtAuthGuard)
	@Get('me')
	async getProfile(@Req() req: Request, @Res() res : Response) {
		const accessToken = req.cookies.access_token;
		const payload = jwt.verify(accessToken,process.env.SECRET_TOKEN) as Record<string,any>
		const user = await this.userService.user({login: payload.login});
		res.json(user);
	}

	@Get(':login')
	async getUserByLogin(@Param('login') login: string): Promise<UserModel> {
	return this.userService.user({ login: (login) });
	}
	@Get(':login/history')
	async getUserGames(@Param('login') login: string): Promise<GameModel[]> {
		return  (await this.gameService.games({where: 
			{OR: [{game_winner: {login: login}}, {game_loser: {login: login}}]},
			orderBy: {game_date: 'desc'},
		}));
	}
	@Get(':login/friendrequests')
		async getUserFriendRequests(@Param('login') login: string): Promise<UserModel[]> {
			return (await this.userService.users({where: {friend_requests: {some: {login: login}}}}));
		}
	@Get(':login/sentfriendrequests')
		async getUserSentFriendRequests(@Param('login') login: string): Promise<UserModel[]> {
			return (await this.userService.users({where: {friend_requests_sent: {some: {login: login}}}}));
		}
	@Get(':login/friends')
	async getUserFriends(@Param('login') login: string): Promise<UserModel[]> {
			return (await this.userService.users({where: {friends: {some: {login: login}}}}));
	}
	@Patch('update')
	async updateUser(@Body()userData: {login: string; nickname?: string; password?: string; avatar?: string; two_factor_auth?: string; current_lobby? : string; status? : Status},)
	{
		let login = userData['login'];
		let user = await this.userService.user({ login: (login) });
		if (!user)
			return null;
		user['nickname'] = userData['nickname'] || user['nickname'];
		user['password'] = userData['password'] || user['password'];
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
		return this.userService.users({orderBy: {KDA: 'desc'}, take: 20});
	}
	
	@Get('/leaderboard/:page')
	async getLeaderboardPage(@Param('page') page: number): Promise<UserModel[]> {
		return this.userService.users({orderBy: {KDA: 'desc'}, take: 20, skip : page * 20});
	}


	@Post('/users/bulk')
	async generateUsers()
	{
		this.userService.generateUsers(100);
	}

	@Post('/users/delete')
	async deleteAllUsers()
	{
		this.userService.deleteAllUsers();
	}
	@Patch('addfriend')
	async addFriend(@Body()userData: {login: string; friend_login: string;})
	{
		let login = userData['login'];
		let friend_login = userData['friend_login'];
		let user = await this.userService.user({ login: (login) });
		let friend = await this.userService.user({ login: (friend_login) });
		if (!user || !friend)
			return null;
		this.userService.addfriends(login, friend_login);
		return (await this.userService.user({ login: (userData['login']) }));
	}
	@Post('acceptfriend')
	async acceptFriend(@Body()userData: {login: string; sender_login: string;})
	{
		let login = userData['login'];
		let friend_login = userData['sender_login'];
		let user = await this.userService.user({ login: (login) });
		let friend = await this.userService.user({ login: (friend_login) });
		if (!user || !friend)
			return null;
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
		return (await this.userService.user({ login: (userData['login']) }));
	}
	@Patch('addfriendrequest')
	async sendFriendRequest(@Body()userData: {login: string; friend_login: string;})
	{
		let login = userData['login'];
		let friend_login = userData['friend_login'];
		let user = await this.userService.user({ login: (login) });
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
	@Patch('deletefriendrequest')
	async deleteFriendRequest(@Body()userData: {login: string; friend_login: string;})
	{
		let login = userData['login'];
		let friend_login = userData['friend_login'];
		let user = await this.userService.user({ login: (login) });
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
	@Patch('deleteSentFriendRequest')
	async deleteSentFriendRequest(@Body()userData: {login: string; friend_login: string;})
	{
		let login = userData['login'];
		let friend_login = userData['friend_login'];
		let user = await this.userService.user({ login: (login) });
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

	@Patch('deletefriend')
	async deleteFriend(@Body()userData: {login: string; friend_login: string;})
	{
		await this.userService.deleteFriends(userData['login'], userData['friend_login']);
		return (await this.userService.user({ login: (userData['login']) }));
	}

}