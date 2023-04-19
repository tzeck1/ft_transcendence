import { Module } from '@nestjs/common';
// import { UserModule } from 'src/user/user.module';
import { TwoFactorAuthController } from './tfa.controller';
import { TwoFactorAuthService } from './tfa.service';
import { Users } from '../user/user.service';

@Module({
	imports: [],
	controllers: [TwoFactorAuthController],
	providers: [TwoFactorAuthService, Users],
})

export class TwoFactorAuthModule {}
