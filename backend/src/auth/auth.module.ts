import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { Api42Strategy } from './42api.strategy';
import { AuthController } from './auth.controller';
import { Users } from '../user/user.service';
import { AppService } from '../app.service';

@Module({
	imports: [PassportModule],
	providers: [Api42Strategy, Users],
	controllers: [AuthController],
})
export class AuthModule {}