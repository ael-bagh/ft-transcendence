import { Injectable } from "@nestjs/common";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";


@Injectable()
export class chatGatewayService {
  constructor() {};

  async emitBroadcast(
	server: Server,
	login : string,
	friend_login : string,) {
	server.to(`__connected_${friend_login}`).emit('became_friends');
	server.to(`__connected_${login}`).emit('became_friends');
}};