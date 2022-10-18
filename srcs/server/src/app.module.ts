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
import { CloudinaryService } from '@/common/services/cloudinary.service';
import { GatewayService } from './common/services/gateway.service';
import { GameGateway } from './common/gateways/game.gateway';
import { NotificationModule } from '@/notification/notification.module';
import { NotificationGateway } from './common/gateways/notification.gateway';
import { AchievementModule } from './achievement/achievement.module';


@Module({
	imports: [
		ConfigModule.forRoot(),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '../..', 'client/dist'),
		}),
		AuthModule,
		HttpModule,
		UserModule,
		GameModule,
		RoomModule,
		NotificationModule,
		AchievementModule
	],
	controllers: [],
	providers: [GameGateway,GatewayService, EventsGateway, ChatGateway, PrismaService, NotificationGateway, CloudinaryService],
})
export class AppModule { }
