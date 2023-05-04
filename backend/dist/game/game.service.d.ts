import { Socket } from 'socket.io';
import { Users } from '../user/user.service';
export declare class GameService {
    readonly users: Users;
    constructor(users: Users);
}
export declare class Player {
    private readonly socket;
    private readonly intraname;
    constructor(socket: Socket, intraname: string);
    private readonly users;
    private username;
    private picture;
    private score;
    updateUserData(): Promise<void>;
    getSocket(): Socket;
    getIntraname(): string;
    getUsername(): string;
    getPicture(): string;
    getScore(): number;
}
export declare class Room {
    private readonly room_id;
    private readonly phaser_config;
    private left_player;
    private right_player;
    constructor(room_id: string, phaser_config: Phaser.Types.Core.GameConfig, left_player: Player, right_player: Player);
    private phaser_instance;
    getRoomId(): string;
    getPhaserConfig(): Phaser.Types.Core.GameConfig;
    getPhaserInstance(): Phaser.Game;
    getLeftPlayer(): Player;
    getRightPlayer(): Player;
}
