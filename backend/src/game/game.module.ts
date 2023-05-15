import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { Game } from './game.service';
import { Games } from './game.service';
import { Users } from '../user/user.service';
import { GameController } from './game.controller';

@Module({
	providers: [GameGateway, Games, Game, Users],
	controllers: [GameController],
})
export class GameModule {}
