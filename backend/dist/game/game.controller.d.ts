import { Game } from "./game.service";
export declare class GameController {
    private readonly games;
    constructor(games: Game);
    setGameData(intra: string, player: string, enemy: string, player_score: number, enemy_score: number, ranked: boolean, paddle_hits_e: number, paddle_hits_m: number): Promise<void>;
    getLastGame(intra: string): Promise<import(".prisma/client").games>;
    getUserGames(intra: string): Promise<import(".prisma/client").games[]>;
}
