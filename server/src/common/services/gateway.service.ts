import { UserService } from "@/user/user.service";
import { Injectable } from "@nestjs/common";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { User } from "@prisma/client";
import { Server } from "socket.io";


@Injectable()
export class GatewayService {
	constructor() { };

	async emitBroadcast(
		server: Server,
		login: string,
		friend_login: string,) {
		server.to(`__connected_${friend_login}`).emit('became_friends');
		server.to(`__connected_${login}`).emit('became_friends');
	}

	async broadcastStatusChangeToFriends(
		server: Server,
		userService: UserService,
		user: User) {
			// const friends = await userService.getUserFriends(user.login);
			// for (let index = 0; index < friends.length; index++) {
			// 	server.to('__connected_' + friends[index])
			// 	.emit(
			// 		"friend_updated_status",
			// 		{ login: user.login, status: user.status }
			// 		);
			// }
	}



};