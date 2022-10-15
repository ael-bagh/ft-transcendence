import { Controller, Get, Query, Redirect, Res, Req, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AuthService } from '@/auth/auth.service';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserService } from '@/user/user.service';
import { Achievements_name } from '@prisma/client';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService, private httpService: HttpService, private userService: UserService) { }

	@Get('login')
	@Redirect(
		'https://api.intra.42.fr/oauth/authorize?' +
		'client_id=' +
		process.env.OAUTH_CLIENT_ID +
		'&redirect_uri=' +
		process.env.OAUTH_CALLBACK +
		'&response_type=code',
	)
	ft_oauth_login() { }

	@Get('logout')
	ft_oauth_logout(@Res() response: Response) {
		response.clearCookie('access_token', {
			path: '/',
			domain: process.env.DOMAIN,
		});
		response.clearCookie('refresh_token', {
			path: '/auth/refresh',
			domain: process.env.DOMAIN,
		});
		response.redirect(process.env.FRONTEND_URL);
	}

	@Get('callback')
	// @Redirect(process.env.URL, 302)
	async ft_callback(@Query() qw, @Res({ passthrough: false }) response: Response) {
		this.httpService
			.post(
				'https://api.intra.42.fr/oauth/token?' +
				'client_id=' +
				process.env.OAUTH_CLIENT_ID +
				'&client_secret=' +
				process.env.OAUTH_CLIENT_SECRET +
				'&grant_type=authorization_code' +
				'&code=' +
				qw['code'] +
				'&redirect_uri=' +
				process.env.OAUTH_CALLBACK,
			)
			.subscribe((value) => {
				this.httpService
					.get('https://api.intra.42.fr/v2/me', {
						headers: {
							Authorization: 'Bearer ' + value.data.access_token,
						},
					})
					.subscribe(async (info) => {

						const user_exists = await this.userService.user({ login: info.data.login, });
						const user = (user_exists ? user_exists : await this.userService.signupUser({
							login: info.data.login,
							nickname: info.data.login,
							email: info.data.email,
							avatar: `https://avatars.dicebear.com/api/micah/${info.data.login}.svg`,
						}));
						if (user.two_factor_auth_enabled) {
							return response.redirect(process.env.FRONTEND_URL + '/2fa/' + user.login);
						}
						const refreshToken = await this.authService.loginAndGenerateRefreshToken(user);
						const accessToken = await this.authService.regenerateAccessTokenWithRefreshToken(user, refreshToken);
						response.cookie('refresh_token', refreshToken, {
							httpOnly: true,
							domain: process.env.DOMAIN,
							path: '/auth/refresh',
						});
						response.cookie('access_token', accessToken, {
							httpOnly: true,
							domain: process.env.DOMAIN,
							path: '/',
						});
						if (user_exists == null){
							this.userService.addAcheivement({
								achievement_name:Achievements_name.WELCOME,
								achievement_user:{
									connect:{
										login:user.login
									}
								}
							})
							response.redirect(process.env.FRONTEND_URL + "/profile/edit");
						}
						else
							response.redirect(process.env.FRONTEND_URL);
						});
			});
	}

	@Get('refresh')
	async getRefreshTockenAndRegenerateAccessToken(@Req() req: Request, @Res() response: Response) {
		const refreshToken = req.cookies["refresh_token"];
		try {
			const payload = jwt.verify(refreshToken, process.env.SECRET_TOKEN) as Record<string, any>;
			const user = await this.userService.user({ login: payload.login });
			if (!user) {
				throw new HttpException('User not found', HttpStatus.NOT_FOUND);
			}
			const accessToken = await this.authService.regenerateAccessTokenWithRefreshToken(user, refreshToken);
			response.cookie('access_token', accessToken, {
				httpOnly: true,
				domain: process.env.DOMAIN,
				path: '/',
			});
			response.json(req.cookies);
		} catch (e) {
			response.json({ authenticied: false });
		}
	}
}
