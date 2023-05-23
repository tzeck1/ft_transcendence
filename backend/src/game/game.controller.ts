import { Controller, Body, Get, Post, Query, UseGuards } from "@nestjs/common";
import { Game } from "./game.service";
import { bufferToggle } from "rxjs";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@Controller('game')
export class GameController {

	constructor(private readonly games: Game) {}

	@UseGuards(JwtAuthGuard)
	@Post('setGameData')
	async setGameData(@Body('intra') intra: string, @Body('player') player: string, @Body('enemy') enemy: string, @Body('player_score') player_score: number, @Body('enemy_score') enemy_score: number, @Body('ranked') ranked: boolean, @Body('paddle_hits_e') paddle_hits_e: number, @Body('paddle_hits_m') paddle_hits_m: number) {
		console.log("went into setGameData");
		return this.games.setGameData(intra, player, enemy, player_score, enemy_score, ranked, paddle_hits_e, paddle_hits_m);
	}

	@UseGuards(JwtAuthGuard)
	@Get('getLastGame')
	async getLastGame(@Query('intra') intra: string) {
		return this.games.getLastGame(intra);
	}

	@UseGuards(JwtAuthGuard)
	@Get('getUserGames')
	async getUserGames(@Query('intra') intra: string) {
		return this.games.getUserGames(intra);
	}

	@UseGuards(JwtAuthGuard)
	@Get('getUserGamesAsc')
	async getUserGamesAsc(@Query('intra') intra: string) {
		return this.games.getUserGamesAsc(intra);
	}

}