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
		private authService: AuthService,
		private httpService: HttpService,
		private userService: UserService,
		private chatService: ChatService
	) { }

	@UseGuards(LocalAuthGuard)
	@Post('auth/login')
	async login(@Req() req) {
		return this.authService.loginAndGenerateRefreshToken(req.user);
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Req() req: any) {
		return req.user;
	}

	@Get('42login')
	@Redirect("https://api.intra.42.fr/oauth/authorize?" +
		"client_id=" + process.env.CL_ID +
		"&redirect_uri=" + process.env.URL + process.env.MD_URI +
		"&response_type=code")
	ft_oauth_login() { }


	@Get(process.env.MD_URI)
	// @Redirect(process.env.URL, 302)
	async ft_callback(@Query() qw, @Res({ passthrough: false }) response: Response) {
		this.httpService.post('https://api.intra.42.fr/oauth/token?' +
			'client_id=' + process.env.CL_ID +
			'&client_secret=' + process.env.CL_SECRET +
			'&grant_type=authorization_code' +
			'&code=' + qw['code'] +
			'&redirect_uri=' + process.env.URL + process.env.MD_URI).subscribe((value) => {
				// LOGIC goes here
				console.log('42 OAUTH', value.data);
				this.httpService.get("https://api.intra.42.fr/v2/me",
					{
						"headers":
						{
							"Authorization": "Bearer " + value.data.access_token
						}
					}).subscribe(async (info) => {
						//remove password
						const user = await this.userService.signupUser({
							login: info.data.login,
							nickname: info.data.login,
							password: value.data.access_token,
							avatar: info.data.image_url
						});
						// Prevent password from being sent out
						delete user.password;
						// Generate both refreshToken and accessToken
						const refreshToken = await this.authService.loginAndGenerateRefreshToken(user);
						const accessToken = await this.authService.regenerateAccessTokenWithRefreshToken(user, refreshToken);
						const refreshExpires = new Date();
						refreshExpires.setSeconds(refreshExpires.getSeconds() + 2);
						response.cookie("refresh_token", refreshToken, {
							httpOnly: true,
							domain: 'localhost',
							path: '/auth/refresh'
						});
						response.cookie("access_token", accessToken, {
							httpOnly: true,
							domain: 'localhost',
							path: '/',
							expires: refreshExpires
						});
						//send the token to be cookied
						response.redirect(process.env.URL);
					});
			});
	}

	@Get("/auth/refresh")
	async getRefreshTockenAndRegenerateAccessToken(@Req() req: Request, @Res() response: Response) {
		const refreshToken = req.cookies.refresh_token;
		const payload = jwt.verify(refreshToken, process.env.SECRET_TOK) as Record<string,any>;
		const user = await this.userService.user({login: payload.login})
		const accessToken = await this.authService.regenerateAccessTokenWithRefreshToken(user, refreshToken);
		response.cookie("access_token", accessToken, {
			httpOnly: true,
			domain: 'localhost',
			path: '/'
		});
		response.json(req.cookies);
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
