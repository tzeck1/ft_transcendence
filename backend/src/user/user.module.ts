import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { Users } from './user.service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [Users],
})
export class UserModule {}