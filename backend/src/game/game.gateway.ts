import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService, Room, Player } from './game.service';
import { Users } from '../user/user.service';

@WebSocketGateway({
	cors: {
		origin: '*',
	},
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(private readonly gameService: GameService, private readonly users: Users) {}

	//		key: room_id
	private rooms: Map<string, Room> = new Map<string, Room>;

	//		key: intraname
	private lobby: Map<string, Player> = new Map<string, Player>;

	private room_counter = 0;
	private threshold = 20;

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
			return;
		let searching_player = new Player(client, intra, this.users);
		await searching_player.updateUserData();
		for (let [intraname, lobby_player] of this.lobby) {
			if (lobby_player.getScore() - this.threshold < searching_player.getScore() && searching_player.getScore() < lobby_player.getScore() + this.threshold) {
				this.createAndJoinRoom(searching_player, lobby_player);
				return;
			}
		}
		searching_player.getSocket().join("lobby");
		console.log("the intra is ", intra, "and the socket is ", client.id);
		this.lobby.set(intra, searching_player);
		searching_player.getSocket().emit("noOpponent");
	}

	createAndJoinRoom(player_one: Player, player_two: Player) {
		this.room_counter += 1;
		let room_id = "game" + this.room_counter.toString();
		player_one.getSocket().leave("lobby");
		player_two.getSocket().leave("lobby");
		this.lobby.delete(player_one.getIntraname());
		this.lobby.delete(player_two.getIntraname());
		let new_room = new Room(room_id, player_one, player_two);
		this.rooms.set(room_id, new_room);
		player_one.getSocket().join(room_id);
		player_two.getSocket().join(room_id);

		player_one.getSocket().emit("foundOpponent", player_two.getUsername(), player_two.getPicture(), room_id);
		player_two.getSocket().emit("foundOpponent", player_one.getUsername(), player_one.getPicture(), room_id);
	}

	@SubscribeMessage("cancelQueue")
	handleCancelQueue(client: Socket, intra: string) {
		console.log("calling handleCancel");
		let player = this.lobby.get(intra);
		client.leave("lobby");
		this.lobby.delete(player.getIntraname());
		client.disconnect(true);
	}


	@SubscribeMessage("iAmReady")
	handleIAmReady(client: Socket, room_id: string) {
		let room = this.rooms.get(room_id);
		room.setupListeners();
		room.validatePlayer(client);
		if (room.isRoomReady() == true) {
			room.getLeftPlayer().getSocket().emit("startTheGame");
			room.getRightPlayer().getSocket().emit("startTheGame");
		}
	}
}
