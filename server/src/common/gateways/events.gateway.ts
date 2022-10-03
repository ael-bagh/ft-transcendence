import { CustomSocket } from "@/auth/auth.adapter";
import { RoomService } from "@/room/room.service";
import { CurrentUser } from "@/user/user.decorator";
import { UserService } from "@/user/user.service";
import { HttpException, HttpStatus} from "@nestjs/common";
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from "@nestjs/websockets"
import { Status, User } from "@prisma/client";
import { Socket, Server } from "socket.io"
import { PrismaService } from "@/common/services/prisma.service";
import { ChatGatewayService } from "../services/chat.gateway.service";

@WebSocketGateway({
	transports: ["websocket"],
	cors: {
		origin: [process.env.FRONTEND_URL],
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
		// console.log(this.server.sockets.adapter.rooms);
		console.log("a user connected", client.user.login);
	}

	async handleDisconnect(client: CustomSocket) {
		// console.log(this.server.sockets.adapter.rooms);
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

	@SubscribeMessage('relationship')
	async friendRelationship(
		@MessageBody() userData: {target_login: string},
		@ConnectedSocket() client: CustomSocket,
	)
	{
		const relationship = await this.userService.getRelationship(client.user.login, userData.target_login)

		client.emit('relationship_sent', relationship);
	}
	@SubscribeMessage('add_friend_request')
	async sendRequest(
		@MessageBody() userData: { target_login: string },
		@ConnectedSocket() client: CustomSocket,
	) {
		console.log(userData);
		let login = client.user.login;
		let target_login = userData.target_login;
		if (!target_login)
		{
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		let allowed = await this.userService.permissionToDoAction({
			action_performer: login,
			action_target: target_login,
			action_mutual: true
		});
		if (!allowed)
		throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		const mutual = await this.userService.sendFriendRequest({
			login, friend_login: target_login, onFinish: (user, target_login, broadcast) => {
				// FIXME: REVISE THIS
				if (broadcast) {
					this.gateWayService.emitBroadcast(this.server, target_login, login);
					
				} else {
					this.server.to(`__connected_${target_login}`).emit('friend_request', user.login);
				}
			}
		});
		client.emit('friend_request_sent', mutual)
	}

	@SubscribeMessage('accept_friend_request')
	async acceptFriendRequest(
		@MessageBody() userData: { target_login: string },
		@ConnectedSocket() client: CustomSocket,
	) {
		let login = client.user.login;
		let target_login = userData?.target_login
		if (!target_login)
		{
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
		client.emit('friend_request_accepted', userData?.target_login)
	}

	@SubscribeMessage('delete_friend')
	delete_friend(
		@MessageBody() userData: { target_login: string },
		@ConnectedSocket() client: CustomSocket,
	) {
		let login = client.user.login;
		 this.userService.deleteFriends(login, userData?.target_login);
		 client.emit('friend_deleted', userData?.target_login)
	}

	@SubscribeMessage('delete_friend_request')
	delete_friend_request(
		@MessageBody() userData: { target_login: string },
		@ConnectedSocket() client: CustomSocket,
	) {
		let login = client.user.login;
		let target_login = userData?.target_login
		if (!target_login)
		{
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		let friend =  this.userService.user({ login: (target_login) });
		if (!client?.user || !friend)
		throw new HttpException('Not found', HttpStatus.NOT_FOUND);
	
		this.userService.remove_request({
			login, friend_login:target_login, 
		});
		client.emit('decline_friend_request', target_login)
	}

	@SubscribeMessage('delete_sent_friend_request')
	delete_sent_friend_request(
		@MessageBody() userData: { target_login: string },
		@ConnectedSocket() client: CustomSocket,
	) {
		let login = client.user.login;
		let target_login = userData['target_login'];
		let friend =  this.userService.user({ login: (target_login) });
		if (!client?.user || !friend)
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		 
		this.userService.remove_request({
			login: target_login, friend_login: login, 
		});
		client.emit('cancel_friend_request', target_login)
	}

	@SubscribeMessage('block_user')
	block_user(
		@MessageBody() userData : { target_login: string},
		@ConnectedSocket() client: CustomSocket,
	)
	{
		let login = client.user.login;
		let user_to_block_login = userData?.target_login
		if (!user_to_block_login)
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		if (!this.userService.user({login: user_to_block_login}))
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		this.userService.block_user({login, user_to_block_login})
		client.emit('blocked', user_to_block_login)
	}

	@SubscribeMessage('unblock_user')
	unblock_user(
		@MessageBody() userData : { target_login: string},
		@ConnectedSocket() client: CustomSocket,
	)
	{
		let login = client.user.login;
		let user_to_unblock_login = userData?.target_login
		if (!user_to_unblock_login)
		throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		if (!this.userService.user({login: user_to_unblock_login}))
		throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		this.userService.unblock_user({login, user_to_unblock_login});
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
