
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/user/user.service';
import TokenPayload from './tokenPayload.interface';

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
		// console.log(payload);

		return this.jwtService.sign(payload, { expiresIn: '60d' });
	}
	async regenerateAccessTokenWithRefreshToken(user: any, refreshToken: string) {
		const payload = this.jwtService.verify(refreshToken);
		// TODO: Only add the minimum required fields instead of ...user
		return this.jwtService.sign({ ...user, refreshId: payload.refreshId });
	}
	public getCookieWithJwtAccessToken(userId: number, isSecondFactorAuthenticated = false) {
		const payload: TokenPayload = { userId, isSecondFactorAuthenticated };
		const token = this.jwtService.sign(payload, {
		  secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
		  expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`
		});
		return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`;
	  }
}
