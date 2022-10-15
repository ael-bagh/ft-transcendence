import { CustomSocket } from "@/auth/auth.adapter";
import { RoomService } from "@/room/room.service";
import { UserService } from "@/user/user.service";
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer, WsException } from "@nestjs/websockets"
import { Server } from "socket.io"
import { PrismaService } from "@/common/services/prisma.service";
import * as dotenv from 'dotenv'
import { compare } from "bcrypt";
dotenv.config()

@WebSocketGateway({
	transports: ["websocket"],
	cors: {
		origin: [process.env.FRONTEND_URL],
		credentials: true
	}
})
export class RoomsGateway {
	constructor(
		private readonly userService: UserService,
		private readonly prisma: PrismaService,
		private readonly roomService: RoomService
	) { };

	@WebSocketServer()
	server: Server;

	@SubscribeMessage('join_room')
	async joinRoom(@ConnectedSocket() client: CustomSocket, @MessageBody() { room_id, room_password }: { room_id: number, room_password?: string }) {
		const result = await this.prisma.room.findUnique({
			where: {
				room_id,
			}
		});
		if (!this.roomService.roomPermissions(client.user.login, 'viewRoom', null, { room_id },)) {
			throw new WsException('Not found');
		}
		if (!(result.room_private) || await compare(room_password, result.room_password)) {
			this.roomService.joinRoom({room_id: room_id}, {login:client.user.login});
			client.join('room_id_'+result.room_id);
			client.emit('joined_room');
			let message = this.roomService.addSystemMessage(client.user.login + " joined the room", room_id)
			const users = await this.roomService.getRoomUsers({room_id:room_id});
			// this.server.to('room_id_'+String(room_id)).emit("message", message);
			users.map(async user =>{
				this.server.to('__connected_'+user.login).emit("message", message)
			});
		}
		else
			client.emit('wrong_password');
	}
	@SubscribeMessage('leave_room')
	async leaveRoom(@ConnectedSocket() client: CustomSocket, @MessageBody() { room_id}: { room_id: number}) {
		const result = await this.prisma.room.findMany({
			where: {
				room_id,
				room_users:{
					some:{
						login: client.user.login,
					}
				}
			}
		});
		if (result.length > 0) {
			client.join('room_id_'+result[0].room_id);
			client.emit('left_room');
			let message = this.roomService.addSystemMessage(client.user.login + " left the room", room_id)
			// this.server.to('room_id_'+String(room_id)).emit("message", message);
			const users = await this.roomService.getRoomUsers({room_id:room_id});
			// this.server.to('room_id_'+String(room_id)).emit("message", message);
			users.map(async user =>{
				this.server.to('__connected_'+user.login).emit("message", message)
			});
		}
		else
			client.emit('not in room');
	}
}
