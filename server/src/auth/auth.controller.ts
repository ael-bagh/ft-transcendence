import {
	Controller, 
	Get, 
	Query, 
	Redirect, 
	Res, 
	Req,
} from '@nestjs/common';
import RequestWithUser from './requestWithUser.interface';
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
	ft_oauth_login(){

	}
	// ft_oauth_login(@Req() request: RequestWithUser) {
	// 	const { user } = request;
	// 	const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(user.user_id);
	// 	const {
	// 	  cookie: refreshTokenCookie,
	// 	  token: refreshToken
	// 	} = this.authService.regenerateAccessTokenWithRefreshToken(user, request.cookies.refresh_token);
	 
	// 	// await this.userService.user.setRefreshToken(refreshToken);
	// 	this.userService.updateUser({
	// 		where : {user_id: user.user_id},
	// 		data: {refreshToken: refreshToken}}
	// 	);
	 
	// 	request.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
	 
	// 	if (user.two_factor_auth_enabled) {
	// 	  return; redirect to 2fa page
	// 	}
	 
	// 	return user;
	//   }


	@Get('logout')
	ft_oauth_logout(@Res() response: Response) {
		response.clearCookie("access_token",{path:'/',domain: process.env.DOMAIN});
		response.clearCookie("refresh_token",{path:'/auth/refresh',domain: process.env.DOMAIN});
		response.redirect(process.env.FRONTEND_URL);
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
							email: info.data.email,

							// password: value.data.access_token,
							avatar: `https://avatars.dicebear.com/api/jdenticon/${info.data.login}.svg`
						});
						// Prevent password from being sent out
						// delete user.password;
						// Generate both refreshToken and accessToken
						const refreshToken = await this.authService.loginAndGenerateRefreshToken(user);
						const accessToken = await this.authService.regenerateAccessTokenWithRefreshToken(user, refreshToken);
						// const refreshExpires = new Date();
						// refreshExpires.setSeconds(refreshExpires.getSeconds() + 2);
						response.cookie("refresh_token", refreshToken, {
							httpOnly: true,
							path: '/auth/refresh'
						});
						response.cookie("access_token", accessToken, {
							httpOnly: true,
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
		try
		{
			const payload = jwt.verify(refreshToken, process.env.SECRET_TOKEN) as Record<string, any>;
			const user = await this.userService.user({ login: payload.login })
			if (!user) {
				throw new Error("User not found");
			}
			const accessToken = await this.authService.regenerateAccessTokenWithRefreshToken(user, refreshToken);
			response.cookie("access_token", accessToken, {
				httpOnly: true,
				path: '/'
			});
			response.json(req.cookies);
		}
		catch(e)
		{
			console.log(e, "oh noo");
             response.json({'authenticied':false});
		}
	}
}