import { Controller, Body, Get, Post, Query } from "@nestjs/common";
import { Game } from "./game.service";
import { bufferToggle } from "rxjs";

@Controller('game')
export class GameController {

	constructor(private readonly games: Game) {}

	@Post('setGameData')
	async setGameData(@Body('intra') intra: string, @Body('player') player: string, @Body('enemy') enemy: string, @Body('player_score') player_score: number, @Body('enemy_score') enemy_score: number, @Body('ranked') ranked: boolean) {
		console.log("went into setGameData");
		return this.games.setGameData(intra, player, enemy, player_score, enemy_score, ranked);
	}

	@Get('getLastGame')
	async getLastGame(@Query('intra') intra: string) {
		return this.games.getLastGame(intra);
	}

	@Get('getUserGames')
	async getUserGames(@Query('intra') intra: string) {
		return this.games.getUserGames(intra);
	}

}