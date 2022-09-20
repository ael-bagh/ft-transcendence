import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { prisma } from '@prisma/client';
import { AppModule } from '@/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AuthAdapter } from '@/auth/auth.adapter';
import { UserService } from '@/user/user.service';
import * as cookieParser from 'cookie-parser';
import { PrismaService } from '@/common/services/prisma.service';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		cors: {
			origin: ['http://frontend.transcendance.com'],
			credentials: true,
		}
	});
	const conf = new ConfigService();
	const user = new UserService(new PrismaService());
	const Adapter = new AuthAdapter(app, conf, user);
	app.use(cookieParser());
	app.useWebSocketAdapter(Adapter);
	const config = new DocumentBuilder()
		.setTitle('Cats example')
		.setDescription('The cats API description')
		.setVersion('1.0')
		.addTag('cats')
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);
	await app.listen(80, '0.0.0.0');
	console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
