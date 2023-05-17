import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService, Player } from './game.service';
import { Users } from '../user/user.service';
export declare class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly gameService;
    private readonly users;
    constructor(gameService: GameService, users: Users);
    private rooms;
    private lobby;
    private room_counter;
    private threshold;
    server: Server;
    afterInit(server: Server): void;
    handleDisconnect(client: Socket): void;
    handleConnection(client: Socket, ...args: any[]): void;
    handleCreateOrJoin(client: Socket, intra: string): Promise<void>;
    createAndJoinRoom(player_one: Player, player_two: Player): void;
    handleCancelQueue(client: Socket, intra: string): void;
    handleScoreRequest(client: Socket, data: any): void;
    handleBallPosition(client: Socket, data: any): void;
    handlePaddleMovement(client: Socket, data: any): void;
    handleIAmReady(client: Socket, room_id: string): void;
}
