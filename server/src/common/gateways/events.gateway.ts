import { CustomSocket } from "@/auth/auth.adapter";
import { RoomService } from "@/room/room.service";
import { CurrentUser } from "@/user/user.decorator";
import { UserService } from "@/user/user.service";
import { Query, Req } from "@nestjs/common";
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from "@nestjs/websockets"
import { Status, User } from "@prisma/client";
import { Socket, Server } from "socket.io"
import { PrismaService } from "@/common/services/prisma.service";
import { ChatGatewayService } from "../services/chat.gateway.service";

@WebSocketGateway({
	transports: ["websocket"],
	cors: {
		origin: ['http://frontend.transcendance.com'],
		credentials: true
	}
})
export class EventsGateway {
	constructor(
		private readonly userService : UserService,
		private readonly prisma : PrismaService,
		private readonly roomServece : RoomService,
		private readonly gateWayService : ChatGatewayService

	) {};

	@WebSocketServer()
	server: Server;
	
	async handleConnection(
		client : CustomSocket
	) {
		client.join('__connected_' + client.user.login);
		await this.prisma.user.update({
			where: { login: client.user.login },
			data: {
				status: Status.ONLINE,
			}
		});
		console.log(this.server.sockets.adapter.rooms);
		console.log("a user connected", client.user.login);
	}

	async handleDisconnect(client: CustomSocket) {
		console.log(this.server.sockets.adapter.rooms);
		client.leave('__connected_' + client.user.login);
		if (!this.server.sockets.adapter.rooms['__connected_' + client.user.login])
		{
			await this.prisma.user.update({
				where: { login: client.user.login },
				data: {
					status: Status.OFFLINE,
				}
			});
		}
		console.log("a user disconnected",client.user.login);
	}

	@SubscribeMessage('identity')
	handleIdentity(
		@MessageBody() data: string,
		@ConnectedSocket() client: CustomSocket
	): string {
		console.log(data, client.user.login);
		return data;
	}

	@SubscribeMessage('events')
	handleEvent(
		@MessageBody() data: string,
		@ConnectedSocket() client: CustomSocket,
	): string {
		console.log(data);
		return data;
	}
	

	// @SubscribeMessage('accept_friend')


	@SubscribeMessage('add_friend_request')
	sendRequest(
		@MessageBody() userData: { friend_login: string },
		@ConnectedSocket() client: CustomSocket,
	) {
		let login = client.user.login;
		let friend_login = userData.friend_login;
		if (!friend_login)
		{
			return null;
		}
		return this.userService.sendFriendRequest({
			login, friend_login, onFinish: (user, friend_login, broadcast) => {
				// FIXME: REVISE THIS
				if (broadcast) {
					this.gateWayService.emitBroadcast(this.server, friend_login, login);
					
				} else {
					this.server.to(`__connected_${friend_login}`).emit('friend_request', user.login);
				}
			}
		});
	}

	@SubscribeMessage('accept_friend_request')
	acceptFriendRequest(
		@MessageBody() userData: { friend_login: string },
		@ConnectedSocket() client: CustomSocket,
	) {
		let login = client.user.login;
		let friend_login = userData?.friend_login
		if (!friend_login)
		{
			return null;
		}
		this.userService.remove_request({
			login, friend_login, onFinish: (login: string, friend_login) => {
				this.gateWayService.emitBroadcast(this.server, friend_login, login);
			}
		});
		return this.userService.addfriends(login, friend_login);
	}

	@SubscribeMessage('delete_friend')
	delete_friend(
		@MessageBody() userData: { friend_login: string },
		@ConnectedSocket() client: CustomSocket,
	) {
		let login = client.user.login;
		 this.userService.deleteFriends(login, userData?.friend_login);
		return ( this.userService.user({ login: (login) }));
	}

	@SubscribeMessage('delete_friend_request')
	delete_friend_request(
		@MessageBody() userData: { friend_login: string },
		@ConnectedSocket() client: CustomSocket,
	) {
		let login = client.user.login;
		let friend_login = userData?.friend_login
		if (!friend_login)
		{
			return null;
		}
		let friend =  this.userService.user({ login: (friend_login) });
		if (!client?.user || !friend)
			return null;
	
		this.userService.remove_request({
			login, friend_login, 
		});
		return ( this.userService.user({ login: (login) }));
	}

	@SubscribeMessage('delete_sent_friend_request')
	delete_sent_friend_request(
		@MessageBody() userData: { friend_login: string },
		@ConnectedSocket() client: CustomSocket,
	) {
		let login = client.user.login;
		let friend_login = userData['friend_login'];
		let friend =  this.userService.user({ login: (friend_login) });
		if (!client?.user || !friend)
			return null;
		 
		this.userService.remove_request({
			login: friend_login, friend_login: login, 
		});
		return ( this.userService.user({ login: (login) }));
	}

	@SubscribeMessage('block_user')
	block_user(
		@MessageBody() userData : { login_to_block: string},
		@ConnectedSocket() client: CustomSocket,
	)
	{
		let login = client.user.login;
		let user_to_block_login = userData?.login_to_block
		if (!user_to_block_login)
			return (null);
		if (!this.userService.user({login: user_to_block_login}))
			return null;
		this.userService.block_user({login, user_to_block_login})
	}

	@SubscribeMessage('unblock_user')
	unblock_user(
		@MessageBody() userData : { login_to_unblock: string},
		@ConnectedSocket() client: CustomSocket,
	)
	{
		let login = client.user.login;
		let user_to_unblock_login = userData?.login_to_unblock
		if (!user_to_unblock_login)
			return (null);
		if (!this.userService.user({login: user_to_unblock_login}))
			return null;
		this.userService.unblock_user({login, user_to_unblock_login});
	}
	// handleNotifications(
	// 	friend_login : string,
	// 	message : string,
	// 	@ConnectedSocket() client: CustomSocket
	// ) : any {
	// 	client.emit(sender_login,message);
	// }
}
