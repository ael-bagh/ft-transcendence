import { CustomSocket } from "@/auth/auth.adapter";
import { RoomService } from "@/room/room.service";
import { CurrentUser } from "@/user/user.decorator";
import { UserService } from "@/user/user.service";
import { HttpException, HttpStatus } from "@nestjs/common";
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from "@nestjs/websockets"
import { Status, User } from "@prisma/client";
import { Socket, Server } from "socket.io"
import { PrismaService } from "@/common/services/prisma.service";
import { GatewayService } from "../services/gateway.service";
import * as dotenv from 'dotenv'
import { NotificationService } from "@/notification/notification.service";
dotenv.config()

@WebSocketGateway({
	transports: ["websocket"],
	cors: {
		origin: [process.env.FRONTEND_URL],
		credentials: true
	}
})
export class EventsGateway {
	constructor(
		private readonly userService: UserService,
		private readonly prisma: PrismaService,
		private readonly roomServece: RoomService,
		private readonly gateWayService: GatewayService,
		private readonly notificationService: NotificationService

	) { };

	@WebSocketServer()
	server: Server;

	async handleConnection(
		client: CustomSocket
	) {
		client.join('__connected_' + client.user.login);
		this.gateWayService.broadcastStatusChangeToFriends(
			this.server,
			this.userService,
			client.user
		);
		// console.log(new Date(), "a user connected", client.user);
	}

	async handleDisconnect(client: CustomSocket) {
		let leftGame = false;
		if (client.game_lobby !== undefined) {
			leftGame = true;
			client.game_lobby.forceEnd(client.user.login);
		}
		if (!this.server.sockets.adapter.rooms['__connected_' + client.user.login]) {
			client.user = await this.prisma.user.update({
				where: { login: client.user.login },
				data: {
					status: Status.OFFLINE,
				}
			});
		}
		else if (leftGame || client.inQueue) {
			client.user = await this.prisma.user.update({
				where: { login: client.user.login },
				data: {
					status: Status.ONLINE,
				}
			});
		}
		this.gateWayService.broadcastStatusChangeToFriends(
			this.server,
			this.userService,
			client.user
		);
		console.log(new Date(), "a user disconnected", client.user);
	}

	@SubscribeMessage('relationship')
	async friendRelationship(
		@MessageBody() userData: { target_login: string },
		@ConnectedSocket() client: CustomSocket,
	) {
		return this.userService.getRelationship(client.user.login, userData.target_login)
	}

	@SubscribeMessage('seen_notification')
	async seenNotification(
		@ConnectedSocket() client: CustomSocket,
	) {
		await this.notificationService.turnSeenToUseen(client.user.login);
	}

	@SubscribeMessage('delete_notification')
	async deleteNotification(
		@MessageBody() userData: { notification_id },
		@ConnectedSocket() client: CustomSocket,
	) {
		const notification = await this.notificationService.getNotification(userData.notification_id);
		if (notification.notification_receiver_login !== client.user.login) {
			throw new HttpException('You are not allowed to delete this notification', HttpStatus.UNAUTHORIZED);
		}
		return await this.notificationService.deleteNotification(userData.notification_id);
	}


	@SubscribeMessage('add_friend_request')
	async sendRequest(
		@MessageBody() userData: { target_login: string },
		@ConnectedSocket() client: CustomSocket,
	) {
		let login = client.user.login;
		let target_login = userData.target_login;
		if (!target_login) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		let allowed = await this.userService.permissionToDoAction({
			action_performer: login,
			action_target: target_login,
			action_mutual: true
		});
		if (!allowed)
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		return {
			isFriend: (await this.userService.sendFriendRequest({
				login, friend_login: target_login, onFinish: async (user, target_login, broadcast) => {
					// FIXME: REVISE THIS
					if (broadcast) {
						const oldNotification = await this.notificationService.findNotification({
							notification_receiver_login: login,
							notification_sender_login: target_login,
							notification_type: 'FRIEND_REQUEST'
						});
						if (oldNotification) {
							await this.notificationService.deleteNotification(oldNotification.notification_id);
						}
						const notification1 = await this.notificationService.addNotification({
							notification_type: 'NEW_FRIEND',
							notification_date: new Date(),
							notification_receiver_login: target_login,
							notification_sender_login: login,
							notification_seen: false,
						});
						const notification2 = await this.notificationService.addNotification({
							notification_type: 'NEW_FRIEND',
							notification_date: new Date(),
							notification_receiver_login: login,
							notification_sender_login: target_login,
							notification_seen: false,
						});
	
						this.gateWayService.emitBroadcast(this.server, target_login, login);
						this.server.to(`__connected_${target_login}`).emit('notification', notification1);
						this.server.to(`__connected_${login}`).emit('notification', notification2);
						return 2;
					}
					else {
						const notification = await this.notificationService.addNotification({
							notification_type: 'FRIEND_REQUEST',
							notification_date: new Date(),
							notification_receiver_login: target_login,
							notification_sender_login: login,
							notification_seen: false,
						});
						this.server.to(`__connected_${target_login}`).emit('notification', notification);
						return 1;
					}
				}
			}))
		}
	}

	@SubscribeMessage('accept_friend_request')
	async acceptFriendRequest(
		@MessageBody() userData: { target_login: string },
		@ConnectedSocket() client: CustomSocket,
	) {
		let login = client.user.login;
		let target_login = userData?.target_login
		if (!target_login) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		let allowed = await this.userService.permissionToDoAction({
			action_performer: login,
			action_target: target_login,
			action_mutual: true
		});
		if (!allowed)
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		this.userService.remove_request({
			login, friend_login: target_login, onFinish: (login: string, target_login) => {
				this.gateWayService.emitBroadcast(this.server, target_login, login);
			}
		});
		this.userService.addfriends(login, target_login);

		const oldNotification = await this.notificationService.findNotification({
			notification_receiver_login: login,
			notification_sender_login: target_login,
			notification_type: 'FRIEND_REQUEST'
		});
		if (oldNotification) {
			await this.notificationService.deleteNotification(oldNotification.notification_id);
		}
		const notification1 = await this.notificationService.addNotification({
			notification_type: 'NEW_FRIEND',
			notification_date: new Date(),
			notification_receiver_login: target_login,
			notification_sender_login: login,
			notification_seen: false,
		});
		const notification2 = await this.notificationService.addNotification({
			notification_type: 'NEW_FRIEND',
			notification_date: new Date(),
			notification_receiver_login: login,
			notification_sender_login: target_login,
			notification_seen: false,
		});
		this.server.to(`__connected_${target_login}`).emit('notification', notification1);
		this.server.to(`__connected_${login}`).emit('notification', notification2);
		return userData?.target_login;
	}

	@SubscribeMessage('delete_friend')
	delete_friend(
		@MessageBody() userData: { target_login: string },
		@ConnectedSocket() client: CustomSocket,
	) {
		let login = client.user.login;
		this.userService.deleteFriends(login, userData?.target_login);
		return userData?.target_login;
	}

	@SubscribeMessage('delete_friend_request')
	async delete_friend_request(
		@MessageBody() userData: { target_login: string },
		@ConnectedSocket() client: CustomSocket,
	) {
		let login = client.user.login;
		let target_login = userData?.target_login
		if (!target_login) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		let friend = this.userService.user({ login: (target_login) });
		if (!client?.user || !friend)
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);

		await this.userService.remove_request({
			login, friend_login: target_login,
		});
		const notif = await this.notificationService.findNotification({
			notification_receiver_login: login,
			notification_sender_login: target_login,
			notification_type: 'FRIEND_REQUEST'
		});
		if (notif) {
			const notif_id = notif.notification_id;
			await this.notificationService.deleteNotification(notif.notification_id);
			this.server.to(`__connected_${login}`).emit('notification', { notification_id: notif_id, notification_type: '' });
		}
		return target_login
	}

	@SubscribeMessage('delete_sent_friend_request')
	async delete_sent_friend_request(
		@MessageBody() userData: { target_login: string },
		@ConnectedSocket() client: CustomSocket,
	) {
		let login = client.user.login;
		let target_login = userData['target_login'];
		let friend = this.userService.user({ login: (target_login) });
		if (!client?.user || !friend)
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);

		await this.userService.remove_request({
			login: target_login, friend_login: login,
		});
		const notif = await this.notificationService.findNotification({
			notification_receiver_login: target_login,
			notification_sender_login: login,
			notification_type: 'FRIEND_REQUEST'
		});
		if (notif) {
			const notif_id = notif.notification_id;
			await this.notificationService.deleteNotification(notif.notification_id);
			this.server.to(`__connected_${target_login}`).emit('notification', { notification_id: notif_id, notification_type: '' });
		}
		client.emit('cancel_friend_request', target_login)
	}

	@SubscribeMessage('block_user')
	block_user(
		@MessageBody() userData: { target_login: string },
		@ConnectedSocket() client: CustomSocket,
	) {
		let login = client.user.login;
		let user_to_block_login = userData?.target_login
		if (!user_to_block_login)
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		if (!this.userService.user({ login: user_to_block_login }))
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		this.userService.block_user({ login, user_to_block_login })
		client.emit('blocked', user_to_block_login)
	}

	@SubscribeMessage('unblock_user')
	unblock_user(
		@MessageBody() userData: { target_login: string },
		@ConnectedSocket() client: CustomSocket,
	) {
		let login = client.user.login;
		let user_to_unblock_login = userData?.target_login
		if (!user_to_unblock_login)
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		if (!this.userService.user({ login: user_to_unblock_login }))
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		this.userService.unblock_user({ login, user_to_unblock_login });
		client.emit('unblocked', user_to_unblock_login)
	}
	// handleNotifications(
	// 	target_login : string,
	// 	message : string,
	// 	@ConnectedSocket() client: CustomSocket
	// ) : any {
	// 	client.emit(sender_login,message);
	// }
}
