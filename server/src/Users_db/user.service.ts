import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User, Prisma, Game } from '@prisma/client';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) { }

	async user(
		userWhereUniqueInput: Prisma.UserWhereUniqueInput,
	): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: userWhereUniqueInput,
			include:
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
		});
	}

	async userWins(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<number> {
		{
			return this.prisma.user.findUnique({
				where: userWhereUniqueInput,
				include: {
					_count: {
						select: {
							games_won: true,
						}
					}
				}
			}).then((user) => user?._count?.games_won ?? 0);
		}
	}

	async userLosses(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<Game[]> {
		{
			return this.prisma.user.findUnique({
				where: userWhereUniqueInput,
			}).games_lost();
		}
	}

	// async userWR(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<number> {
	// 	{
	// 		const wins = await this.userWins(userWhereUniqueInput);
	// 		const losses = await this.userLosses(userWhereUniqueInput);
	// 		if (wins.length + losses.length === 0) {
	// 			return 0;
	// 		}
	// 		return (wins.length / (wins.length + losses.length));
	// 	}
	// }

	async deleteFriends(user_login:string, friend_login:string)
	{
		await this.prisma.user.update({
			where : {login: (friend_login)},
			data : {
				friends: {
					disconnect: {
						login: user_login,
					},
				},
			},
		});
		await this.prisma.user.update({
			where : {login: (user_login)},
			data : {
				friends: {
					disconnect: {
						login: friend_login,
					},
				},
			},
		});
		return;
	}
	async addfriends(user_login:string, friend_login:string)
	{
		await this.prisma.user.update({
			where : {login: (friend_login)},
			data : {
				friends: {
					connect: {
						login: user_login,
					},
				},
			},
		});
		await this.prisma.user.update({
			where : {login: (user_login)},
			data : {
				friends: {
					connect: {
						login: friend_login,
					},
				},
			},
		});
		return;
	}
	async users(params: {
		skip?: number;
		take?: number;
		cursor?: Prisma.UserWhereUniqueInput;
		where?: Prisma.UserWhereInput;
		orderBy?: Prisma.UserOrderByWithRelationInput;
	}): Promise<User[]> {
		const { skip, take, cursor, where, orderBy } = params;
		return this.prisma.user.findMany({
			skip,
			take,
			cursor,
			where,
			orderBy,
		});
	}

	async createUser(data: Prisma.UserCreateInput): Promise<User> {
		return this.prisma.user.create({
			data,
		});
	}

	async updateUser(params: {
		where: Prisma.UserWhereUniqueInput;
		data: Prisma.UserUpdateInput;
	}): Promise<User> {
		const { where, data } = params;
		return this.prisma.user.update({
			data,
			where,
		});
	}

	async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
		return this.prisma.user.delete({
			where,
		});
	}

	async deleteAllUsers(): Promise<Prisma.BatchPayload> {
		return this.prisma.user.deleteMany({});
	}

	async generateUsers(number_wanted: number)
	{
		for (let i = 0; i < number_wanted; i++)
		{
			await this.prisma.user.create({
				data: {
					user_id: i,
					login: 'user' + i,
					nickname: 'user' + i,
					password: 'user' + i,
					KDA: i,
				}
			});
		}
	}

}