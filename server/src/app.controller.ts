import { Controller, Get, Request, Post, UseGuards, Query, Redirect, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { Response } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

@Controller()
export class AppController {
	constructor(
		private authService: AuthService,
		private httpService: HttpService
	) { }

	@UseGuards(LocalAuthGuard)
	@Post('auth/login')
	async login(@Request() req) {
		return this.authService.login(req.user);
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Request() req: any) {
		return req.user;
	}

	@Get('42login')
	@Redirect("https://api.intra.42.fr/oauth/authorize?" +
		"client_id=" + process.env.CL_ID +
		"&redirect_uri=" + process.env.URL + process.env.MD_URI +
		"&response_type=code")
	test() {}

	@Get(process.env.MD_URI)
	async test2(@Query() qw, @Res({ passthrough: false }) response: Response) {
		this.httpService.post('https://api.intra.42.fr/oauth/token?' +
			'client_id=' + process.env.CL_ID +
			'&client_secret=' + process.env.CL_SECRET +
			'&grant_type=authorization_code' +
			'&code=' + qw['code'] +
			'&redirect_uri=' + process.env.URL + process.env.MD_URI).subscribe((value) => {
				// LOGIC goes here
				console.log('42 OAUTH', value.data);
				response.redirect(process.env.URL);
			})
	}
}
