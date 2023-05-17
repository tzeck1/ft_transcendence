import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService, User, Channel } from './chat.service';
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
		this.chatService.addChannel("global", null);
		console.log('Chat Initialized');
	}

	handleDisconnect(client: Socket) {
		console.log(`Chat Client Disconnected: ${client.id}`);
	}

	handleConnection(client: Socket, ...args: any[]) {
		let intra = client.handshake.query.intra as string;
		this.chatService.addUser(intra, client);
		console.log(`Chat Client Connected: ${client.id}`);
	}

	@SubscribeMessage("messageToServer")
	handleMessageToServer(client: Socket, ...args: any[]) {
		console.log("message args inside 'messageToServer' listener:", args[0]);
		let intra = this.chatService.getIntraFromSocket(client);
		let response = this.chatService.resolvePrompt(client, args[0]);
		this.server.to(response[0]).emit("messageToClient", intra, response[1]);
	}
}
