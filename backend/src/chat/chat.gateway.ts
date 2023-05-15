import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Users } from '../user/user.service';


@WebSocketGateway({
	namespace: '/chat_socket',
	cors: {
		origin: '*',
	},
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(private readonly chatService: ChatService, private readonly users: Users) {}

	@WebSocketServer() server: Server;

	afterInit(server: Server) {
		console.log('Chat Initialized');
	}

	handleDisconnect(client: Socket) {
		console.log(`Chat Client Disconnected: ${client.id}`);
	}

	handleConnection(client: Socket, ...args: any[]) {
		console.log(`Chat Client Connected: ${client.id}`);
	}

}
