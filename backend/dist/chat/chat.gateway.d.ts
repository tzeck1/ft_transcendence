import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Users } from '../user/user.service';
export declare class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    private readonly users;
    constructor(chatService: ChatService, users: Users);
    server: Server;
    afterInit(server: Server): void;
    handleConnection(client: Socket, ...args: any[]): void;
    handleDisconnect(client: Socket): void;
    handleMessageToServer(client: Socket, ...args: any[]): Promise<boolean | void>;
    handleRequestChatHistory(client: Socket, ...args: any[]): void;
    handleSetIngameStatus(client: Socket, ...args: any[]): void;
}
