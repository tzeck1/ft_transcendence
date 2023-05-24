import { Module } from '@nestjs/common';
// import { UserModule } from 'src/user/user.module';
import { TwoFactorAuthController } from './tfa.controller';
import { TwoFactorAuthService } from './tfa.service';
import { Users } from '../user/user.service';
import { AuthService } from 'src/auth/auth.service';

@Module({
	imports: [],
	controllers: [TwoFactorAuthController],
	providers: [TwoFactorAuthService, Users, AuthService],
})

export class TwoFactorAuthModule {}
