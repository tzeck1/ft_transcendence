import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { ChatModule } from './chat/chat.module';
import { TwoFactorAuthModule } from './two-factor-auth/tfa.module'

@Module({
	imports: [
		AuthModule,
		UserModule,
		TwoFactorAuthModule,
		GameModule,
		ChatModule,
	],
	controllers: [AppController],
	providers: [AppService],
})

export class AppModule {}
