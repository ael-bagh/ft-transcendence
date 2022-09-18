import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from "./events.module";
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './Users_db/user.module';
import { GameModule } from './Games_db/game.module';
import { ChatModule } from './Rooms_db/chat.module';
import { UsersModule } from './users/users.module';

@Module({
	imports: [
		ConfigModule.forRoot(),
		EventsModule,
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'client'),
		}),
		AuthModule,
		HttpModule,
		UserModule,
		GameModule,
		ChatModule,
		UsersModule
	],
	  controllers: [AppController],
	  providers: [AppService],
})
export class AppModule { }
