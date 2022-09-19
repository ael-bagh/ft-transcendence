import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from "@nestjs/websockets"
import { Socket, Server } from "socket.io"

@WebSocketGateway()
export class EventsGateway {
	@WebSocketServer()
	server: Server;

	handleDisconnect(client: Socket) {
		console.log("a user disconnected");
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
