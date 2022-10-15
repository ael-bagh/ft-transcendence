import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';
import { User, Prisma, Game, Status } from '@prisma/client';
import { use } from 'passport';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) { }


	async user(
		userWhereUniqueInput: Prisma.UserWhereUniqueInput,
		include?: Prisma.UserInclude

	): Promise<User | null> {
		if (userWhereUniqueInput == null)
			return null;
		return this.prisma.user.findUnique({
			where: userWhereUniqueInput,
			include: include
		});
	}


	async getUsersFriendsBySegment(
		login: string,
		segment?: string
	): Promise<User[] | null> {
		const users = await this.users({
			where: {
				OR :[
					{
						nickname: {
							contains: segment,
						},
					},
					{
						login: {
							contains: segment,
						},
					}
				],
				friends: {
					some: {
						login: login
					}
				}
			}
		})
		return users;
	}

	async getUsersBysegment(
		login: string,
		segment?: string
	): Promise<User[] | null> {
		const users = await this.users({
			where: {
				OR :[
					{
						nickname: {
							contains: segment,
						},
					},
					{
						login: {
							contains: segment,
						},
					}
				],
			}
		})
		return users;
	}

	async getUserFriends(
		login: string,
		segment?: string
	): Promise<User[] | null> {
		if ((await this.user({ login: login }) == null))
			return null;
		const users = await this.users({
			where: {
				friends: {
					some: {
						login: login
					}
				}
			}
			// OR:[
			// 	{
			// 		nickname:{
			// 			contains: segment,
			// 		},
			// 	},
			// 	{
			// 		login: {
			// 			contains: segment,
			// 		},
			// 	},
			//	]
		})
		return users;
	}


	async getRelationship(
		login: string,
		friend_login: string,
	): Promise<{ is_friend: boolean, is_request_sent: boolean, is_request_received: boolean, is_blocked: boolean }> {
		let relationships = { is_request_sent: false, is_request_received: false, is_friend: false, is_blocked: false, is_self: false };
		if (login == friend_login) {
			relationships.is_self = true;
			return relationships;
		}
		if (await this.getFriendBool({
			where: {
				login: login,
				friends: {
					some: {
						login: friend_login,
					}
				}
			}
		}))
			relationships['is_friend'] = true;
		if (await this.getFriendBool({
			where: {
				login: login,
				friend_requests_sent: {
					some: {
						login: friend_login,
					}
				}
			}
		}))
			relationships['is_request_sent'] = true;
		if (await this.getFriendBool({
			where: {
				login: login,
				friend_requests: {
					some: {
						login: friend_login,
					}
				}
			}
		}))
			relationships['is_request_received'] = true;
		// is blocked
		if (await this.getFriendBool({
			where: {
				login: login,
				blocked_users: {
					some: {
						login: friend_login,
					}
				}
			}
		}))
			relationships['is_blocked'] = true;
		return relationships;
	}
	async userFields(
		login: string,
		includename: string
	)
		: Promise<User[] | null> {
		if (includename == 'sent_requests') {

			let users = await this.prisma.user.findUnique({
				where: {
					login: login
				},
				select: {
					friend_requests_sent: true,
				}

			});
			return users.friend_requests_sent;
		}
		else if (includename == 'received_requests') {
			let users = await this.prisma.user.findUnique({
				where: {
					login: login
				},
				select: {
					friend_requests: true,
				}

			});
			return users.friend_requests;
		}
		else
			return null;

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
		action_performer: string,
		action_target: string,
		action_mutual: boolean,
	}): Promise<boolean> {
		const { action_performer, action_target, action_mutual } = params;
		const action_performer_user = await this.user({ login: action_performer });
		const action_target_user = await this.user({ login: action_target });
		if (action_performer_user == null || action_target_user == null)
			return false;
		if (action_mutual == true) {

			if ((await this.prisma.user.count({
				where: {
					OR: [
						{
							login: action_performer,
							blocked_users: {
								some: {
									login: action_target,
								}
							}
						},
						{
							login: action_target,
							blocked_by_users: {
								some: {
									login: action_performer,
								}
							}
						}
					]
				}
			})) > 0)
				return false;

		}
		else {
			if ((await this.prisma.user.count({
				where: {
					login: action_performer,
					blocked_by_users: {
						some: {
							login: action_target,
						}
					}
				}
			})) > 0)
				return false;
		}
		return true;
	}

	async signupUser(
		userData: { login: string; nickname: string; avatar: string, email: string },
	): Promise<User> {
		userData['KDA'] = 0;
		userData['two_factor_auth'] = '';
		userData['creation_date'] = new Date();
		userData['current_lobby'] = null;
		userData['player_level'] = 0.00;
		userData['winrate'] = 0.00;
		userData['status'] = Status.OFFLINE;
		userData['winrate'] = 0.00;
		userData['is_banned'] = false;
		userData['two_factor_auth_enabled'] = false;
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
	): Promise<Boolean> {
		const { login, friend_login } = params;
		const friend = await this.user({ login: friend_login });
		const user = await this.user({ login: login });
		if (!user || !friend)
			return null;
		let mutual = await this.prisma.user.count({
			where: {
				friend_requests: { some: { login: friend_login } },
				login: login
			}
		});
		if (mutual == 0) {
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
		return (mutual > 0);
	}

	async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
		return this.prisma.user.delete({
			where,
		});
	}

	async deleteAllUsers(): Promise<Prisma.BatchPayload> {
		return this.prisma.user.deleteMany({});
	}

	async addAcheivement(data : Prisma.AchievementCreateInput) {
		return this.prisma.achievement.create({
			data: data
		})
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
	/**
	 * 2FA methods, Added by @Hescanor
	 */

	 async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
		return await this.prisma.user.update({
		  where: { user_id: userId },
		  data: { two_factor_auth: secret },
		});
	  }
	  
	  async turnTwoFactorAuthentication(userId: number, turn: boolean, secret?: string) {
		return this.prisma.user.update({
		  where: { user_id: userId },
		  data: {
			two_factor_auth_enabled: turn,
			two_factor_auth: secret,
		  },
		});
	  }
}