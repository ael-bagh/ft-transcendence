import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { UserModule } from '../Users_db/user.module';
import { AuthAdapter } from './auth.adapter';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
	imports: [
		HttpModule,
		UserModule,
		PassportModule,
		JwtModule.register({
			secret: jwtConstants.secret,
			signOptions: { expiresIn: '2h' },
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, LocalStrategy, JwtStrategy, AuthAdapter, ConfigService],
	exports: [AuthService, AuthAdapter],
})
export class AuthModule { }
