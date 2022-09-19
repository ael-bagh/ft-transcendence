import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './Users_db/user.module';
import { GameModule } from './Games_db/game.module';
import { ChatModule } from './Rooms_db/chat.module';
import { EventsGateway } from './common/gateways/events.gateway'

@Module({
	imports: [
		ConfigModule.forRoot(),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'client'),
		}),
		AuthModule,
		HttpModule,
		UserModule,
		GameModule,
		ChatModule
	],
	controllers: [],
	providers: [EventsGateway],
})
export class AppModule { }
