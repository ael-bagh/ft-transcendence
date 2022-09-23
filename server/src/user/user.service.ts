import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';
import { User, Prisma, Game, Status } from '@prisma/client';

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
	
	async userPermissions(
		action_perfomer: Prisma.UserWhereUniqueInput,
		action: string,
		action_target: Prisma.UserWhereUniqueInput,
	): Promise<Boolean> {
		switch	(action) {
			// add user permissions here.
		}
		return false;
	}

	async deleteFriends(user_login: string, friend_login: string) {
		await this.prisma.user.update({
			where: { login: (friend_login) },
			data: {
				friends: {
					disconnect: {
						login: user_login,
					},
				},
			},
		});
		await this.prisma.user.update({
			where: { login: (user_login) },
			data: {
				friends: {
					disconnect: {
						login: friend_login,
					},
				},
			},
		});
		return;
	}
	async addfriends(user_login: string, friend_login: string) {
		await this.prisma.user.update({
			where: { login: (friend_login) },
			data: {
				friends: {
					connect: {
						login: user_login,
					},
				},
			},
		});
		await this.prisma.user.update({
			where: { login: (user_login) },
			data: {
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
			data
		});
	}

	async signupUser(
		userData: { login: string; nickname: string; avatar: string; two_factor_auth?: string; creation_date?: Date; current_lobby?: string; KDA?: number },
	): Promise<User> {
		const user_exists = await this.user({ login: userData['login'] });
		if (user_exists != null) {
			console.log(user_exists, "hi");
			return user_exists;
		}
		console.log(user_exists);
		userData['avatar'] = userData['avatar'];
		userData['KDA'] = 0;
		userData['two_factor_auth'] = 'false';
		userData['creation_date'] = new Date();
		userData['current_lobby'] = null;
		userData['player_level'] = 0.00;
		userData['winrate'] = 0.00;
		userData['status'] = Status.OFFLINE;
		userData['winrate'] = 0.00;
		userData['is_banned'] = false;
		return this.createUser(userData);
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

	async addSocketIdToUser(user_login: string, socket_id: string): Promise<User> {
		const user = await this.user({ login: user_login });
		return this.prisma.user.update({
			where: { login: user_login },
			data: {
				chat_sockets_id:{
					set: [...user.chat_sockets_id, socket_id],
				},
				status: Status.ONLINE,
			}
		});
	}

	async removeSocketIdFromUser(user_login: string, socket_id: string): Promise<User> {
		let user = await this.user({ login: user_login });
		this.prisma.user.update({
			where: { login: user_login },
			data: {
				chat_sockets_id:{
					set: user.chat_sockets_id.filter((id) => id != socket_id),
				},
			}
		});
		user = await this.user({ login: user_login });
		if (user.chat_sockets_id.length == 0) {
			return this.prisma.user.update({
				where: { login: user_login },
				data: {
					status: Status.OFFLINE,
				}
			});
		}
		return await this.user({ login: user_login });
	}



}