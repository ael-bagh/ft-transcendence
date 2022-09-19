
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/Users_db/user.service';

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
		private configService: ConfigService
	) { }

	async validateUser(login: string, pass: string): Promise<any> {
		return await this.userService.user({ login: login });
	}
	async loginAndGenerateRefreshToken(user: any) {
		const payload = { login: user.login, sub: user.user_id, refreshId: Math.random().toString(16).slice(2) + Date.now() };
		console.log(payload);

		return this.jwtService.sign(payload, { expiresIn: '60d' });
	}
	async regenerateAccessTokenWithRefreshToken(user: any, refreshToken: string) {
		const payload = this.jwtService.verify(refreshToken);
		return this.jwtService.sign({ ...user, refreshId: payload.refreshId });
	}
}
