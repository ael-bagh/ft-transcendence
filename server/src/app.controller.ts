import { Controller, Get, Request, Post, UseGuards, Query, Redirect, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
// import { JwtAuthGuard } from './auth/jwt-auth.guard';
// import { LocalAuthGuard } from './auth/local-auth.guard';
// import { AuthService } from './auth/auth.service';
import { Response } from 'express';
import * as dotenv from 'dotenv';
import { UserService } from './Users_db/user.service';
import { ChatService } from './Rooms_db/chat.service';

dotenv.config();

@Controller()
export class AppController {
	constructor(
		// private authService: AuthService,
		private httpService: HttpService,
		private userService: UserService,
		private chatService: ChatService
	) { }

	// @UseGuards(LocalAuthGuard)
	// @Post('auth/login')
	// async login(@Request() req) {
	// 	return this.authService.login(req.user);
	// }

	// @UseGuards(JwtAuthGuard)
	// @Get('profile')
	// getProfile(@Request() req: any) {
	// 	return req.user;
	// }

	@Get('42login')
	@Redirect("https://api.intra.42.fr/oauth/authorize?" +
		"client_id=" + process.env.CL_ID +
		"&redirect_uri=" + process.env.URL + process.env.MD_URI +
		"&response_type=code")
	test() {}


	@Get(process.env.MD_URI)
	@Redirect("", 302)
	async test2(@Query() qw, @Res({ passthrough: false }) response: Response) {
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
				}).subscribe((info)=>{
					this.userService.signupUser({login : info.data.login,nickname:info.data.login,password:value.data.access_token,avatar:info.data.image_url});
					console.log(info.data.login);
					
				});
				// response.redirect(process.env.URL);

			})
			return {
				url: process.env.URL,
			}
	}

	@Get("chat/createRoom")
	async test3(@Query() qw){
		this.chatService.createRoom(
			{
				chat_name: qw['name'], chat_creator_id: 1, chat_private: false,
			}
		);
	}
}
