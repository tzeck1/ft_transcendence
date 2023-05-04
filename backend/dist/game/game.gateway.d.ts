import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService, Player } from './game.service';
export declare class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly gameService;
    constructor(gameService: GameService);
    private rooms;
    private lobby;
    private room_counter;
    private threshold;
    private config;
    server: Server;
    afterInit(server: Server): void;
    handleDisconnect(client: Socket): void;
    handleConnection(client: Socket, ...args: any[]): void;
    handleCreateOrJoin(client: Socket, intra: string): void;
    createAndJoinRoom(player_one: Player, player_two: Player): void;
}
