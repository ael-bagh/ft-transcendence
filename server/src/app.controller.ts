import { Controller, Get, Request, Post, UseGuards, Query, Redirect, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { Response } from 'express';

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
	@Redirect("https://api.intra.42.fr/oauth/authorize?client_id=c4e3158bff816d266f123d8a488289b1e0dac50b4d2b2e7cdd82a228fc3b4569&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fhihi&response_type=code")
	test() { }

	@Get('hihi')
	async test2(@Query() qw, @Res({ passthrough: false }) response: Response) {
		this.httpService.post('https://api.intra.42.fr/oauth/token?' +
			'client_id=c4e3158bff816d266f123d8a488289b1e0dac50b4d2b2e7cdd82a228fc3b4569' +
			'&client_secret=416be3b032eb63731eaa09c8f7623bc2dc1838702803729b47cb2066df4943aa' +
			'&grant_type=authorization_code' +
			'&code=' + qw['code'] +
			'&redirect_uri=http://localhost:3000/hihi').subscribe((value) => {
				// LOGIC goes here
				console.log('42 OAUTH', value.data);
				response.redirect('http://localhost:3000');
			})
	}
}
