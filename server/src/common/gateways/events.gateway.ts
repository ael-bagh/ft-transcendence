import { CustomSocket } from "@/auth/auth.adapter";
import { RoomService } from "@/room/room.service";
import { CurrentUser } from "@/user/user.decorator";
import { UserService } from "@/user/user.service";
import { Query, Req } from "@nestjs/common";
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from "@nestjs/websockets"
import { Status, User } from "@prisma/client";
import { Socket, Server } from "socket.io"
import { PrismaService } from "@/common/services/prisma.service";

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
		private readonly roomServece : RoomService
	) {};

	@WebSocketServer()
	server: Server;
	
	async handleConnection(
		client : CustomSocket
	) {
		client.join('__connected_' + client.user.user_id);
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
		client.leave('__connected_' + client.user.user_id);
		if (!this.server.sockets.adapter.rooms['__connected_' + client.user.user_id])
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

	@SubscribeMessage('search_rooms')
	searchForRoom(@MessageBody() query: string, @ConnectedSocket() client: CustomSocket,) {
		/// prisma.rooms.find(name contains query)
		client.emit('hello');

	}
	@SubscribeMessage('join_room')
	joinRoom(@ConnectedSocket() client: CustomSocket,) {
		/// prisma.rooms.find(name contains query)
		client.emit('hello');

	}
	@SubscribeMessage('identity')
	handleIdentity(
		@MessageBody() data: string,
		@ConnectedSocket() client: CustomSocket
	): string {
		console.log(data);
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
	@SubscribeMessage('message')
	handleMessages(
		@MessageBody() data: any,
		@ConnectedSocket() client: CustomSocket,
	): string {
		this.server.emit("message", "Gest" + client.id + ": " + data);
		console.log("Gest" + client.id + ":",data);
		return data;
	}
	
	// handleNotifications(
	// 	friend_login : string,
	// 	message : string,
	// 	@ConnectedSocket() client: CustomSocket
	// ) : any {
	// 	client.emit(sender_login,message);
	// }
}
