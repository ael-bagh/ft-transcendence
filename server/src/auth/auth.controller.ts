import { Controller, Get, Query, Redirect, Res, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AuthService } from '@/auth/auth.service';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserService } from '@/user/user.service';


@Controller("auth")
export class AuthController {
	constructor(
		private authService: AuthService,
		private httpService: HttpService,
		private userService: UserService
	) { }

	@Get('login')
	@Redirect("https://api.intra.42.fr/oauth/authorize?" +
		"client_id=" + process.env.OAUTH_CLIENT_ID +
		"&redirect_uri=" + process.env.OAUTH_CALLBACK +
		"&response_type=code")
	ft_oauth_login() {

	}


	@Get("callback")
	// @Redirect(process.env.URL, 302)
	async ft_callback(@Query() qw, @Res({ passthrough: false }) response: Response) {
		this.httpService.post('https://api.intra.42.fr/oauth/token?' +
			'client_id=' + process.env.OAUTH_CLIENT_ID +
			'&client_secret=' + process.env.OAUTH_CLIENT_SECRET +
			'&grant_type=authorization_code' +
			'&code=' + qw['code'] +
			'&redirect_uri=' + process.env.OAUTH_CALLBACK).subscribe((value) => {
				// LOGIC goes here
				// console.log('42 OAUTH', value.data);
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
						// const refreshExpires = new Date();
						// refreshExpires.setSeconds(refreshExpires.getSeconds() + 2);
						response.cookie("refresh_token", refreshToken, {
							httpOnly: true,
							domain: '.transcendance.com',
							path: '/auth/refresh'
						});
						response.cookie("access_token", accessToken, {
							httpOnly: true,
							domain: '.transcendance.com',
							// expires: refreshExpires,
							path: '/'
						});
						//send the token to be cookied
						response.redirect(process.env.FRONTEND_URL);
						// response.redirect(process.env.BACKEND_URL);
					});
			});
	}

	@Get("refresh")
	async getRefreshTockenAndRegenerateAccessToken(@Req() req: Request, @Res() response: Response) {
		const refreshToken = req.cookies.refresh_token;
		const payload = jwt.verify(refreshToken, process.env.SECRET_TOKEN) as Record<string, any>;
		const user = await this.userService.user({ login: payload.login })
		const accessToken = await this.authService.regenerateAccessTokenWithRefreshToken(user, refreshToken);
		response.cookie("access_token", accessToken, {
			httpOnly: true,
			domain: '.transcendance.com',
			path: '/'
		});
		response.json(req.cookies);
	}
}