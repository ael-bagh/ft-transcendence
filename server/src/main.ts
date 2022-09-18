import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { prisma } from '@prisma/client';
import { AppModule } from './app.module';
import { AuthAdapter } from './auth/auth.adapter';
import { PrismaService } from './prisma.service';
import { UserService } from './Users_db/user.service';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const conf = new ConfigService();
  const user = new UserService(new PrismaService());
  const Adapter = new AuthAdapter(app,conf,user);
	app.use(cookieParser());
  app.useWebSocketAdapter(Adapter);
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
