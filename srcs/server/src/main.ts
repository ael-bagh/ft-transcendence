import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AuthAdapter } from '@/auth/auth.adapter';
import { UserService } from '@/user/user.service';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv'
dotenv.config()

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		cors: {
			origin: [process.env.FRONTEND_URL],
			credentials: true,
		},
		logger: false,
	});
	const conf = app.get(ConfigService);
	const user = app.get(UserService);
	const Adapter = new AuthAdapter(app, conf, user);
	app.use(cookieParser());
	app.setGlobalPrefix('/api');
	app.useWebSocketAdapter(Adapter);
	const config = new DocumentBuilder()
		.setTitle('Cats example')
		.setDescription('The cats API description')
		.setVersion('1.0')
		.addTag('cats')
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('documentation', app, document);
	await app.listen(80, '0.0.0.0');
	console.log(new Date(), `Application is running on: ${await app.getUrl()}`);
}
bootstrap();
