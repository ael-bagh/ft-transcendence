import { CustomSocket } from "@/auth/auth.adapter";
import { RoomService } from "@/room/room.service";
import { CurrentUser } from "@/user/user.decorator";
import { UserService } from "@/user/user.service";
import { Query, Req } from "@nestjs/common";
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from "@nestjs/websockets"
import { Room, Status, User } from "@prisma/client";
import { Socket, Server } from "socket.io"
import { PrismaService } from "@/common/services/prisma.service";
import * as dotenv from 'dotenv'
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
		if ((result.room_private && room_password == (result.room_password)) || !result.room_private) {
			client.join('rooom_id_'+result.room_id);
			client.emit('joined_room');
			let message = this.roomService.addSystemMessage("joined_room", room_id)
			this.server.to('rooom_id_'+String(room_id)).emit("message", message);
		}
		else
			client.emit('wrong_password');
	}
	@SubscribeMessage('leave_room')
	async leaveRoom(@ConnectedSocket() client: CustomSocket, @MessageBody() { room_id, room_password }: { room_id: number, room_password?: string }) {
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
			client.join('rooom_id_'+result[0].room_id);
			client.emit('left_room');
			let message = this.roomService.addSystemMessage("left_room", room_id)
			this.server.to('rooom_id_'+String(room_id)).emit("message", message);
		}
		else
			client.emit('not in room');
	}
}
