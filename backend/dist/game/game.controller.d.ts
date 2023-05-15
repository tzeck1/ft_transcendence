import { Game } from "./game.service";
export declare class GameController {
    private readonly games;
    constructor(games: Game);
    setGameData(intra: string, enemy: string, player_score: number, enemy_score: number, ranked: boolean): Promise<void>;
    getLastGame(intra: string): Promise<import(".prisma/client").games>;
}
