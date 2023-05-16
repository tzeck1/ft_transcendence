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

	//		key: channel_id
	private channels: Map<string, Channel> = new Map<string, Channel>;

	//		key: intraname
	private members: Map<string, User> = new Map<string, User>;
	private global_channel: Channel = new Channel("global", null);

	@WebSocketServer() server: Server;

	afterInit(server: Server) {
		this.channels.set("global", this.global_channel);
		console.log('Chat Initialized');
	}

	handleDisconnect(client: Socket) {
		console.log(`Chat Client Disconnected: ${client.id}`);
	}

	handleConnection(client: Socket, ...args: any[]) {
		let intra = client.handshake.query.intra as string;
		let user = new User(intra, this.users, client, this.global_channel);

		this.members.set(intra, user);

		client.join("global");
		console.log(`Chat Client Connected: ${client.id}`);
	}

	@SubscribeMessage("messageToServer")
	handleMessageToServer(client: Socket, ...args: any[]) {
		let intra: string;

		for (let [intraname, user] of this.members) {
			if (user.getSocket() == client) {
				intra = intraname;
				break;
			}
		}
		console.log("message args inside subscribemessage:", args[0]);
		this.server.to("global").emit("messageToClient", intra, args[0]);
	}

}
