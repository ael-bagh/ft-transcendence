import { CustomSocket } from "@/auth/auth.adapter";
import { RoomService } from "@/room/room.service";
import { CurrentUser } from "@/user/user.decorator";
import { UserService } from "@/user/user.service";
import { Query, Req } from "@nestjs/common";
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from "@nestjs/websockets"
import { Room, Status, User } from "@prisma/client";
import { Socket, Server } from "socket.io"
import { PrismaService } from "@/common/services/prisma.service";

@WebSocketGateway({
	transports: ["websocket"],
	cors: {
		origin: ['http://frontend.transcendance.com'],
		credentials: true
	}
})
export class RoomsGateway {
	constructor(
		private readonly userService: UserService,
		private readonly prisma: PrismaService,
		private readonly roomServece: RoomService
	) { };

	@WebSocketServer()
	server: Server;

	@SubscribeMessage('search_rooms')
	searchForRoom(@MessageBody() segment: string, @ConnectedSocket() client: CustomSocket) {
		/// prisma.rooms.find(name contains query)
		const result = this.prisma.room.findMany({
			where: {
				room_name: {
					contains: segment,
				}
			}
		})
		client.emit('found_rooms', result);

	}

	@SubscribeMessage('join_room')
	async joinRoom(@ConnectedSocket() client: CustomSocket, @MessageBody() { room_id, room_password }: { room_id: number, room_password?: string }) {
		const result = await this.prisma.room.findUnique({
			where: {
				room_id,
			}
		});
		if ((result.room_private && room_password == (result.room_password)) || !result.room_private) {
			client.join(result.room_name);
			client.emit('joined_room');
		}
		else
			client.emit('wrong_password');
	}
}
