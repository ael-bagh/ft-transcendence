import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';
import { User, Prisma, Game, Status } from '@prisma/client';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) { }


	async user(
		userWhereUniqueInput: Prisma.UserWhereUniqueInput,
	): Promise<User | null> {
		if (!userWhereUniqueInput)
			return null;
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

	async getFriendBool(
		where,
	): Promise<boolean> {
		return ((await this.prisma.user.count(where)) > 0);
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
		switch (action) {
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

	async block_user(params: {
		login: string,
		user_to_block_login: string
	}) {
		const { login, user_to_block_login } = params;
		const user_exists = await this.user({ login: user_to_block_login })
		if (user_exists == null)
			return null;
		this.remove_request({ login: login, friend_login: user_to_block_login })
		this.remove_request({ login: user_to_block_login, friend_login: login })
		this.deleteFriends(login, user_to_block_login);
		this.updateUser({
			where: {
				login: login,
			},
			data: {
				blocked_users: {
					connect: {
						login: user_to_block_login,
					}
				}
			}
		})
		this.updateUser({
			where: {
				login: user_to_block_login,
			},
			data: {
				blocked_by_users: {
					connect: {
						login: login
					}
				}
			}
		})
	}

	async unblock_user(params: {
		login: string,
		user_to_unblock_login: string,
	}) {
		const { login, user_to_unblock_login } = params;
		this.updateUser({
			where: {
				login: login
			},
			data: {
				blocked_users: {
					disconnect: {
						login: user_to_unblock_login,
					}
				}
			}
		});
		this.updateUser({
			where: {
				login: user_to_unblock_login,
			},
			data: {
				blocked_by_users: {
					disconnect: {
						login: login,
					}
				}
			}
		})
	}

	async permissionToDoAction(params: {
		action_performer: Prisma.UserWhereUniqueInput,
		action_target: Prisma.UserWhereUniqueInput,
	}) {
		const { action_performer, action_target } = params;
		const action_performer_user = await this.user(action_performer);
		const action_target_user = await this.user(action_target);
		if (action_performer_user == null || action_target_user == null)
			return false;
		if (action_performer_user.login == action_target_user.login)
			return false;
		if ((await this.prisma.user.count({
			where: {
				OR: [
					{
						login: action_performer_user.login,
						blocked_users: {
							some: {
								login: action_target_user.login,
							}
						}
					},
					{
						login: action_target_user.login,
						blocked_by_users: {
							some: {
								login : action_performer.login,
							}
						}
					}
				]

			}
		})) > 0)
			return false;
		return true;
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

	async remove_request(params: {
		login: string
		friend_login: string;
		onFinish?: (user: string, friend_login: string) => void;
	},): Promise<User> {
		params.onFinish && params.onFinish(params.login, params.friend_login);
		await this.updateUser({
			where: { login: (params.friend_login) },
			data: {
				friend_requests_sent: {
					disconnect: {
						login: params.login,
					},
				},
			},
		});
		return await this.updateUser(
			{
				where: { login: (params.login) },
				data: {
					friend_requests: {
						disconnect: {
							login: params.friend_login,
						},
					},
				},
			}
		);
	}

	async sendFriendRequest(params: {
		login: string;
		friend_login: string;
		onFinish?: (user: User, friend_login: string, broadcast: boolean) => void;
	}
	): Promise<User> {
		const { login, friend_login } = params;
		console.log(login, friend_login);
		const friend = await this.user({ login: friend_login });
		const user = await this.user({ login: login });
		if (!user || !friend)
			return null;
		// if not mutual request
		console.log('survived')
		let mutual = await this.users({
			where: {
				friend_requests: { some: { login: login } },
				login: friend_login
			}
		});
		console.log('mutual:', mutual);
		if (mutual.length == 0) {
			await this.updateUser({
				where: { login: (friend_login) },
				data: {
					friend_requests: {
						connect: {
							login: login,
						},
					},
				},
			});
			await this.updateUser({
				where: { login: (login) },
				data: {
					friend_requests_sent: {
						connect: {
							login: friend_login,
						},
					},
				},
			});
			params.onFinish && params.onFinish(user, friend_login, false);
		}
		else {
			await this.addfriends(login, friend_login);
			await this.updateUser({
				where: { login: (login) },
				data: {
					friend_requests: {
						disconnect: {
							login: friend_login,
						},
					},
				},
			});
			await this.updateUser({
				where: { login: (friend_login) },
				data: {
					friend_requests_sent: {
						disconnect: {
							login: login,
						},
					},
				},
			});
			params.onFinish && params.onFinish(user, friend_login, true);
		}
		return this.user({ login: login });
	}

	async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
		return this.prisma.user.delete({
			where,
		});
	}

	async deleteAllUsers(): Promise<Prisma.BatchPayload> {
		return this.prisma.user.deleteMany({});
	}

	async searchUsers(segment: string, user: User): Promise<User[]> {
		return (await this.prisma.user.findMany({
			where: {
				login: {
					contains: segment,
				},
				NOT: {
					OR: [
						{
							blocked_users: {
								some: {
									login: user.login
								}
							},
						},
						{
							blocked_by_users: {
								some: {
									login: user.login
								}
							}
						}
					]
				}
			}
		}));
	}
}