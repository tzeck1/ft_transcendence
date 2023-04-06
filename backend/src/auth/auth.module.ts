import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { Api42Strategy } from '../42-api.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [PassportModule],
  providers: [Api42Strategy],
  controllers: [AuthController],
})
export class AuthModule {}