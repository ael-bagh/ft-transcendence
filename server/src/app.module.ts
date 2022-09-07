import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from "./events.module";
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
	imports: [
		EventsModule,
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'client'),
		}),
		AuthModule,
		UsersModule,
		HttpModule,
	],
	  controllers: [AppController],
	  providers: [AppService],
})
export class AppModule { }
