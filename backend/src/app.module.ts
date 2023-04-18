import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TwoFactorAuthModule } from './two-factor-auth/tfa.module'

@Module({

	imports: [
		AuthModule,
		UserModule,
		TwoFactorAuthModule,
	],
	controllers: [AppController],
	providers: [AppService],
})

export class AppModule {}
