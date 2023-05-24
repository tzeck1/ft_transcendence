import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { Users } from './user.service';
import { AuthService } from 'src/auth/auth.service';

@Module({

	imports: [],
	controllers: [UserController],
	providers: [Users, AuthService],
})

export class UserModule {}