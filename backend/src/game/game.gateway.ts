import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
  } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { Users } from '../user/user.service';
  
  @WebSocketGateway({
	cors: {
	  origin: '*',
	},
  })
  export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly users: Users,
		private readonly gameService: GameService,
	) {}

	private intra_clients: Map<string, Socket> = new Map<string, Socket>;
	private rooms: Map<string, string> = new Map<string, string>;
	private room_id = 0;

	@WebSocketServer() server: Server;

	afterInit(server: Server) {
		console.log('Initialized');
		//create a lobby socket.io room
	}
	
	handleDisconnect(client: Socket) {
		console.log(`Client Disconnected: ${client.id}`);
	}
	
	handleConnection(client: Socket, ...args: any[]) {
		console.log(`Client Connected: ${client.id}`);
	}

	@SubscribeMessage("createOrJoin")
	async handleCreateOrJoin(client: Socket, intra: string) {
		if (intra == '') //store problem
			return ;
		client.join("lobby");
		this.intra_clients.set(intra, client);
		const pairedIntra = await this.matchMake(client, intra, this.intra_clients);
		if (pairedIntra != undefined) {
			let pairedUser  = await this.users.getUsername(await this.users.getId(pairedIntra));
			let pairedPic   = await this.users.getAvatarByIntra(pairedIntra);
			let searchingUser  = await this.users.getUsername(await this.users.getId(intra));
			let searchingPic   = await this.users.getAvatarByIntra(intra);
			this.server.to(this.intra_clients.get(pairedIntra).id).emit("foundOpponent", searchingUser, searchingPic);
			this.server.to(client.id).emit("foundOpponent", pairedUser, pairedPic);
		}
	}

	async matchMake(client: Socket, searching_intra: string, intra_clients: Map<string, Socket>): Promise<string> {
		for (let [key, element] of intra_clients) {
			if (key != searching_intra 
				&& (await this.users.getScore(searching_intra) > await this.users.getScore(key) - 20 
				||  await this.users.getScore(searching_intra) < await this.users.getScore(key) + 20)) {
				client.leave("lobby");
				element.leave("lobby");
				let room_name = this.createRoom(element.id);
				client.join(room_name);
				element.join(room_name);
				return key;
			}
		}
		client.emit("noOpponent");
		return undefined;
	}

	createRoom(client_id: string): string
	{
		this.room_id += 1;
		let name = "game" + this.room_id.toString();
		this.rooms.set(client_id, name);
		return name;
	}
  }