import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path';
import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/user/user.module';
import { GameModule } from '@/game/game.module';
import { RoomModule } from '@/room/room.module';
import { ChatGateway } from './common/gateways/chat.gateway';
import { EventsGateway } from '@/common/gateways/events.gateway'
import { PrismaService } from '@/common/services/prisma.service';
import { ChatGatewayService } from './common/services/chat.gateway.service';
import { GameGateway } from './common/gateways/game.gateway';

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
		RoomModule
	],
	controllers: [],
	providers: [GameGateway,ChatGatewayService, EventsGateway, ChatGateway, PrismaService],
})
export class AppModule { }
