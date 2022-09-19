import { Controller, Get, Post, UseGuards, Query, Redirect, Res, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import { UserService } from './Users_db/user.service';
import { ChatService } from './Rooms_db/chat.service';

dotenv.config();

@Controller()
export class AppController {
	constructor(
		private userService: UserService,
		private chatService: ChatService
	) { }

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	async getProfile(@Req() req: Request, @Res() res : Response) {
		const accessToken = req.cookies.access_token;
		const payload = jwt.verify(accessToken,process.env.SECRET_TOKEN) as Record<string,any>
		const user = await this.userService.user({login: payload.login});
		res.json(user);
	}

	@Get("chat/createRoom")
	async test3(@Query() qw) {
		this.chatService.createRoom(
			{
				chat_name: qw['name'], chat_creator_id: 1, chat_private: false,
			}
		);
	}
}
