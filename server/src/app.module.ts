import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from "./events.module";
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path';
// import { AuthModule } from './auth/auth.module';
import { UserModule } from './Users_db/user.module';
import { GameModule } from './Games_db/game.module';

@Module({
	imports: [
		EventsModule,
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'client'),
		}),
		// AuthModule,
		HttpModule,
		UserModule,
		GameModule
	],
	  controllers: [AppController],
	  providers: [AppService],
})
export class AppModule { }
