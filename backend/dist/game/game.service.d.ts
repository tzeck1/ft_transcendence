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
    constructor(socket: Socket, intraname: string, users: Users);
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
    private left_player;
    private right_player;
    constructor(room_id: string, left_player: Player, right_player: Player);
    private left_player_status;
    private right_player_status;
    private left_score;
    private right_score;
    private ball_x;
    private ball_y;
    private left_player_y;
    private right_player_y;
    getRoomId(): string;
    getLeftPlayer(): Player;
    getRightPlayer(): Player;
    movePlayer(player: Player, inputPayload: any): void;
    isRoomReady(): boolean;
    validatePlayer(client: Socket): void;
}
