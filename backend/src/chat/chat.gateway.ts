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
		this.chatService.addChannel("global", undefined, undefined);
		console.log('Chat Initialized');
	}

	handleDisconnect(client: Socket) {
		console.log(`Chat Client Disconnected: ${client.id}`);
	}

	handleConnection(client: Socket, ...args: any[]) {
		let intra = client.handshake.query.intra as string;
		if (this.chatService.getIntraFromSocket(client) != intra) {
			this.chatService.addUser(intra, client);
			console.log(`Chat Client Connected: ${client.id}`);
		}
		else
			client.disconnect();
	}

	/**
	 * 	@response [0]: socket room to emit to
	 * 	@response [1]: if command, usually the same prompt the user has entered with trailing newline. Otherwise empty.
	 * 	@response [2]: response in form of message/command response/error message
	 */
	@SubscribeMessage("messageToServer")
	handleMessageToServer(client: Socket, ...args: any[]) {
		console.log("message args inside 'messageToServer' listener:", args[0]);
		let user = this.chatService.getUser(client);
		console.log("user:", user.getIntraname());
		let username = user.getUsername() + ": ";
		console.log("username:", user.getUsername());
		let response = this.chatService.resolvePrompt(client, args[0]);
		if (client.id == response[0])
			username = "";
		this.server.to(response[0]).emit("messageToClient", username, response[1] + response[2]);
	}
}
