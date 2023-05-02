import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { Users } from '../user/user.service';
export declare class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly users;
    private readonly gameService;
    constructor(users: Users, gameService: GameService);
    private intra_clients;
    private rooms;
    private room_id;
    server: Server;
    afterInit(server: Server): void;
    handleDisconnect(client: Socket): void;
    handleConnection(client: Socket, ...args: any[]): void;
    handleCreateOrJoin(client: Socket, intra: string): Promise<void>;
    matchMake(client: Socket, searching_intra: string, intra_clients: Map<string, Socket>): Promise<string>;
    createRoom(client_id: string): string;
}
