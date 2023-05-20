import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService, type Channel, type User} from './chat.service';
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
	async handleMessageToServer(client: Socket, ...args: any[]) {
		let input: string = args[0];
		if (input.length > 250)
			input = input.substring(0, 249);
		let tokens: string[] = input.split(' ');
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
		else if (tokens[0] == "/operator" && tokens.length == 2)
		 	response = this.chatService.operator(client, tokens[1]);
		else if (tokens[0] == "/kick" && tokens.length == 2)
			response = this.chatService.kick(client, tokens[1]);
		else if (tokens[0] == "/ban" && tokens.length == 2)
			response = this.chatService.ban(client, tokens[1]);
		else if (tokens[0] == "/mute" && tokens.length == 3) {
			if (isNaN(parseInt(tokens[2])) == true)
				return this.server.to(client.id).emit("messageToClient", "Error: ", "please provide a valid duration.");
			response = this.chatService.mute(client, tokens[1], parseInt(tokens[2]));
		}
		else if (tokens[0] == "/unmute" && tokens.length == 2)
			response = this.chatService.mute(client, tokens[1], 0);
		else if (tokens[0] == "/visit" && tokens.length == 2)
			response = await this.chatService.visit(client, tokens[1]);
		else if (tokens[0] == "/invite" && tokens.length == 2)
			response = this.chatService.invite(client, tokens[1]);
		else if (tokens[0] == "/set" && tokens.length == 3)
			response = this.chatService.set(client, tokens[1], tokens[2]);
		else if (tokens[0] == "/block" && tokens.length == 2)
			response = await this.chatService.block(client, tokens[1]);
		else if (tokens[0] == "/unset" && tokens.length == 2)
			response = this.chatService.unset(client, tokens[1]);
		else if (tokens[0] == "/unblock" && tokens.length == 2)
			response = await this.chatService.unblock(client, tokens[1]);
		else if (tokens[0] == "/demote" && tokens.length == 2)
			response = this.chatService.demote(client, tokens[1])
		else if (tokens[0][0] == '/')
			response = this.chatService.unknown(client, tokens[0]);
		else
			response = this.chatService.message(client, input);
		if (response == undefined)
			return console.error("'ChatGateway::handleMessageToServer' returned without emitting with 'messageToClient' due to (response == undefined)");
		let recipient = response[0];
		let sender = response[1]
		let message_body = response[2];
		this.server.to(recipient).emit("messageToClient", sender, message_body);
	}

	@SubscribeMessage("requestChatHistory")
	handleRequestChatHistory(client: Socket, ...args: any[]) {
		let channel_id = args[0];
		let channel: Channel = this.chatService.getChannelFromId(channel_id);
		if (channel != undefined) {
			let user: User = this.chatService.getUserFromSocket(client)
			let pending_message: string;
			if (user != undefined && user.getPendingMessage() != undefined)
				pending_message = user.getPendingMessage();
			let chat_history: [string, string][] = channel.getChatHistory();
			client.emit("ChatHistory", chat_history, pending_message);
			user.setPendingMessage(undefined);
		}
	}
}
