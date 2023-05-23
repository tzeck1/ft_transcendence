import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';

dotenv.config();

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors({
		origin: `http://${process.env.HOST_IP}:8080`,
		credentials: true,
	});
	app.use(cookieParser());
	await app.listen(3000);
}

bootstrap();