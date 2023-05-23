import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { Api42Strategy } from './42api.strategy';
import { AuthController } from './auth.controller';
import { Users } from '../user/user.service';
import { AppService } from '../app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';


@Module({
	imports: [
		PassportModule,
		ConfigModule.forRoot(),
		JwtModule.register({
			global: true,
			secret: jwtConstants.secret,
			signOptions: { expiresIn: '1200s' },
		  }),
	],
	providers: [Api42Strategy, Users, AuthService],
	controllers: [AuthController],
})
export class AuthModule {}