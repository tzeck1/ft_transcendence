import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService, Channel } from './chat.service';
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
		this.chatService.addChannel("global", undefined, true, undefined);
		console.log('Chat Initialized');
	}

	handleConnection(client: Socket, ...args: any[]) {
		let intra = client.handshake.query.intra as string;
		// FIXME this is for disallowing a conection in second tab
		// I am using getIntraFromSocket but should be using getSocketFromIntra
		if (this.chatService.getIntraFromSocket(client) != intra) {
			this.chatService.addUser(intra, client);
			console.log(`Chat Client Connected: ${client.id}`);
		}
		else
			client.disconnect(true);
		let sender = "Floppy: ";
		let message_body = "Welcome to ft_transcendence!\nType '/help' for a list of commands.";
		client.emit("messageToClient", sender, message_body);
	}

	handleDisconnect(client: Socket) {
		console.log(`Chat Client Disconnected: ${client.id}`);
	}

	@SubscribeMessage("messageToServer")
	handleMessageToServer(client: Socket, ...args: any[]) {
		let tokens: string[] = args[0].split(' ');
		let response: [string, string, string];
		if (tokens[0] == "/help" && tokens.length == 1)
			response = this.chatService.help(client);
		else if (tokens[0] == "/create" && (tokens.length == 2 || tokens.length == 3))
			response = this.chatService.create(client, tokens[1], tokens[2]);
		else if (tokens[0] == "/join" && (tokens.length == 2 || tokens.length == 3))
			response = this.chatService.join(client, tokens[1], tokens[2]);
		else if (tokens[0] == "/dm" && (tokens.length == 2 || tokens.length == 3))
			response = this.chatService.dm(client, tokens[1], tokens[2]);
		else if (tokens[0] == "/leave" && tokens.length == 1)
			response = this.chatService.leave(client);
		
		// else if (tokens[0] == "/operator" && tokens.length == 2)
		// 	response = this.chatService.make_admin(client, tokens[1]);
		

		else if (tokens[0][0] == '/')
			response = this.chatService.unknown(client, tokens[0]);
		else
			response = this.chatService.message(client, args[0]);
		let recipient = response[0];
		let sender = response[1]
		let message_body = response[2];
		this.server.to(recipient).emit("messageToClient", sender, message_body);
	}

	@SubscribeMessage("requestChatHistory")
	handleRequestChatHistory(client: Socket, ...args: any[]) {
		//console.log("RECEIVING event requestChatHistory on server");
		let channel_id = args[0];
		let channel = this.chatService.getChannelFromId(channel_id);
		//if (channel == undefined) {
		//	console.log("But channel is undefined with channelId:", channel_id);
		//}
		if (channel != undefined) {
			let chat_history: [string, string][] = channel.getChatHistory();
			//console.log("Channel is not undefined and following chat_history is emitted:", chat_history);
			client.emit("ChatHistory", chat_history);
		}
	}
}
