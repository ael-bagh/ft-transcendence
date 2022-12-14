import { Module } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { JwtStrategy } from '@/auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '@/user/user.module';
import { AuthAdapter } from '@/auth/auth.adapter';
import { ConfigService } from '@nestjs/config';
import { AuthController } from '@/auth/auth.controller';
import { HttpModule } from '@nestjs/axios';
import { TwoFactorAuthenticationController } from '@/auth/twoFactorAuthentication.controller';
import { TwoFactorAuthenticationService } from '@/auth/twoFactorAuthentication.service';


@Module({
	imports: [
		HttpModule,
		UserModule,
		PassportModule,
		JwtModule.register({
			secret: process.env.SECRET_TOKEN,
			signOptions: { expiresIn: '2h' },
		}),
	],
	controllers: [AuthController, TwoFactorAuthenticationController],
	providers: [AuthService, JwtStrategy, AuthAdapter, ConfigService, TwoFactorAuthenticationService],
	exports: [AuthService, AuthAdapter],
})
export class AuthModule { }
