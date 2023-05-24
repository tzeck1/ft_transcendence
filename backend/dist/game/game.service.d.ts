import { Socket } from 'socket.io';
import { Users } from '../user/user.service';
export declare class GameService {
    readonly users: Users;
    constructor(users: Users);
}
export declare class Player {
    private readonly socket;
    private readonly intraname;
    private readonly users;
    private readonly mode;
    constructor(socket: Socket, intraname: string, users: Users, mode?: string);
    private username;
    private picture;
    private score;
    updateUserData(): Promise<void>;
    getSocket(): Socket;
    getIntraname(): string;
    getMode(): string;
    getUsername(): string;
    getPicture(): string;
    getScore(): number;
}
export declare class Room {
    private readonly room_id;
    private left_player;
    private right_player;
    constructor(room_id: string, left_player: Player, right_player: Player);
    private left_player_status;
    private right_player_status;
    private left_score_status;
    private right_score_status;
    private left_score;
    private right_score;
    private ball_x;
    private ball_y;
    private left_player_y;
    private right_player_y;
    private height;
    private width;
    private ball_start_velocity;
    private ball_spawn_distance;
    private next_ball_spawn_left;
    private next_ball_spawn_right;
    getRoomId(): string;
    getLeftPlayer(): Player;
    getRightPlayer(): Player;
    moveBoth(player: Player, enemy: Player, inputPayload: any): void;
    setNewBallData(x: number, y: number, velocity: any, speed: number): void;
    isRoomReady(): boolean;
    isScoreTrue(): boolean;
    validatePlayer(client: Socket): void;
    validateScore(client: Socket): void;
    spawn_ball(): void;
    playerScored(player: Player): void;
}
