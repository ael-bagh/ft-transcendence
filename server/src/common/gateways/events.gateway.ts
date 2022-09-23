import { Query } from "@nestjs/common";
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from "@nestjs/websockets"
import { Socket, Server } from "socket.io"

@WebSocketGateway({namespace:'/chat'})
export class EventsGateway {
	@WebSocketServer()
	server: Server;

	handleDisconnect(client: Socket) {
		console.log("a user disconnected");
	}
	handleConnection(
		client : Socket
	) {
		console.log("a user connected");
	}

	@SubscribeMessage('search_rooms')
	searchForRoom(@MessageBody() query: string, @ConnectedSocket() client: Socket,) {
		/// prisma.rooms.find(name contains query)
		client.emit('hello');

	}
	@SubscribeMessage('join_room')
	joinRoom(@ConnectedSocket() client: Socket,) {
		/// prisma.rooms.find(name contains query)
		client.emit('hello');

	}
	@SubscribeMessage('identity')
	handleIdentity(
		@MessageBody() data: string,
		@ConnectedSocket() client: Socket,
	): string {
		console.log(data);
		return data;
	}

	@SubscribeMessage('events')
	handleEvent(
		@MessageBody() data: string,
		@ConnectedSocket() client: Socket,
	): string {
		console.log(data);
		return data;
	}
	@SubscribeMessage('message')
	handleMsg(
		@MessageBody() data: string,
		@ConnectedSocket() client: Socket,
	): string {
		this.server.emit("message", "Gest" + client.id + ": " + data);
		console.log("Gest" + client.id + ": " + data);
		return data;
	}
}
