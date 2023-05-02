import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { Users } from '../user/user.service';

@Module({
	providers: [GameGateway, GameService, Users],
})
export class GameModule {}
