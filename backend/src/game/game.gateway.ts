import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Games, Game, Room, Player } from './game.service';
import { Users } from '../user/user.service';
import { ChatService } from '../chat/chat.service'

@WebSocketGateway({
	namespace: '/game_socket',
	cors: {
		origin: '*',
	},
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(private readonly games: Games, private readonly users: Users, private readonly gameService: Game) {}

	//		key: room_id
	private rooms: Map<string, Room> = new Map<string, Room>;

	//		key: intraname
	private lobby: Map<string, Player> = new Map<string, Player>;

	private invite_array: [string, string, Player][] = new Array<[string, string, Player]>;

	private room_counter = 0;
	private threshold = 300;

	@WebSocketServer() server: Server;

	afterInit(server: Server) {
		console.log('Game Initialized');
		//create a lobby socket.io room
	}

	handleDisconnect(client: Socket) {
		console.log(`Game Client Disconnected, starting to set DB and kick other: ${client.id}`);

		// i disconnect, so i should get a lose and my enemy gets a win
		for (let [room_id, room] of this.rooms) {
			if (room && room.getLeftPlayer().getSocket().id == client.id) {
				if (room.getLeftPlayer().getMode() == "") {
					this.gameService.setGameData(room.getLeftPlayer().getIntraname(),
																					room.getLeftPlayer().getUsername(),
																					room.getRightPlayer().getUsername(),
																					0, 3,
																					(room.getLeftPlayer().getMode() == ""),
																					0, 0);
					this.gameService.setGameData(room.getRightPlayer().getIntraname(),
																					room.getRightPlayer().getUsername(),
																					room.getLeftPlayer().getUsername(),
																					3, 0,
																					(room.getRightPlayer().getMode() == ""),
																					0, 0);
				}
				let other_player_socket = room.getRightPlayer().getSocket();
				other_player_socket.emit("sendToProfile");
				this.rooms.delete(room_id);
				return;
			}
			if (room && room.getRightPlayer().getSocket().id == client.id) {
				if (room.getLeftPlayer().getMode() == "") {
					this.gameService.setGameData(room.getRightPlayer().getIntraname(),
																					room.getRightPlayer().getUsername(),
																					room.getLeftPlayer().getUsername(),
																					0, 3,
																					(room.getRightPlayer().getMode() == ""),
																					0, 0);
					this.gameService.setGameData(room.getLeftPlayer().getIntraname(),
																					room.getLeftPlayer().getUsername(),
																					room.getRightPlayer().getUsername(),
																					3, 0,
																					(room.getLeftPlayer().getMode() == ""),
																					0, 0);
				}
				let other_player_socket = room.getLeftPlayer().getSocket();
				other_player_socket.emit("sendToProfile");
				this.rooms.delete(room_id);
				return;
			}
		}
	}

	handleConnection(client: Socket, ...args: any[]) {
		console.log(`Game Client Connected: ${client.id}`);
	}

	@SubscribeMessage("endGame")
	handleEndGame(client: Socket, ...args: any[]) {
		let room = this.rooms.get(args[0].room_id);
		if (room == undefined || room.getLeftPlayer().getSocket() != client)
			return;
		room.getLeftPlayer().getSocket().emit("destroyGame", args[0].left_e, args[0].left_m);
		room.getRightPlayer().getSocket().emit("destroyGame", args[0].right_e, args[0].right_m);
	}

	@SubscribeMessage("setGameDataAndRoute")
	handleSetGameDataAndRoute(client: Socket, ...args: any[]) {
		this.gameService.setGameData(args[0].intra, args[0].player, args[0].enemy, args[0].player_score, args[0].enemy_score,
									args[0].ranked, args[0].paddle_hits_e, args[0].paddle_hits_m);
		console.log("room is destroyed");
		this.rooms.delete(args[0].room_id);
		console.log("client.disconnect will be called in game.gateway.ts' setGameDataAndRoute");
		client.disconnect();
	}

	private searchInviteArray(intra: string, other_intra: string): Player {
		console.log(this.invite_array);
		for (let tuple of this.invite_array) {
			if ((tuple[0] == intra || tuple[1] == intra) && (tuple[0] == other_intra || tuple[1] == other_intra)) {
				return tuple[2];
			}
		}
		return undefined;
	}

	reapInactiveSocketsLobby() {
		for (let [intra, player] of this.lobby) {
			if (player.getSocket().connected == false) {
				this.lobby.delete(intra);
				this.reapInactiveSocketsLobby();
				return;
			}
		}
	}

	reapInactiveSocketsInvites() {
		for (let tuple of this.invite_array) {
			if (tuple[2].getSocket().connected == false) {
				let index = this.invite_array.indexOf(tuple);
				this.invite_array.splice(index, 1);
				this.reapInactiveSocketsInvites();
				return;
			}
		}
	}

	//data2 opponent name, data3 if invited
	@SubscribeMessage("createOrJoinMode")
	async handleCreateOrJoinMode(client: Socket, data: any) {
		this.reapInactiveSocketsLobby();
		let searching_player = new Player(client, data[0], this.users, data[1], data[2]);
		await searching_player.updateUserData();
		for (let [intraname, lobby_player] of this.lobby) {
			if (searching_player.getIntraname() == lobby_player.getIntraname())
				return ;
			else if (searching_player.getMode() == lobby_player.getMode() && ((data[3] == false && lobby_player.getOpponent() == "") || lobby_player.getOpponent() == searching_player.getUsername())) {
				this.createAndJoinRoom(searching_player, lobby_player);
				return;
			}
			console.log("curent players mode: ", searching_player.getMode());
			console.log("possible players mode: ", lobby_player.getMode());
		}
		searching_player.getSocket().join("lobby");
		console.log("the intra is ", data[0], "and the socket is ", client.id);
		this.lobby.set(data[0], searching_player);
		searching_player.getSocket().emit("noOpponent");
	}

	@SubscribeMessage("createOrJoin")
	async handleCreateOrJoin(client: Socket, intra: string) {
		this.reapInactiveSocketsLobby();
		let searching_player = new Player(client, intra, this.users);
		await searching_player.updateUserData();
		for (let [intraname, lobby_player] of this.lobby) {
			if (searching_player.getIntraname() == lobby_player.getIntraname())
				return ;
			else if (lobby_player.getMode() == "" && lobby_player.getRank() - this.threshold < searching_player.getRank() && searching_player.getRank() < lobby_player.getRank() + this.threshold) {
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
		console.log("cancelQueue was called");
		let player = this.lobby.get(intra);
		client.leave("lobby");
		this.lobby.delete(player.getIntraname());
		//client.disconnect(true);
	}

	@SubscribeMessage("destroyRoom")
	handleDestroyRoom(client: Socket, room_id: string) {
		console.log("room is destroyed");
		this.rooms.delete(room_id);
	}

	@SubscribeMessage("scoreRequest")
	handleScoreRequest(client: Socket, data: any) {
		let room = this.rooms.get(data.room);
		let player;
		if (data.left_player_scored == true/*client == room.getLeftPlayer().getSocket()*/)
			player = room.getLeftPlayer();
		else
			player = room.getRightPlayer();
		room.validateScore(client);
		if (/*room.isScoreTrue() == true*/client == room.getLeftPlayer().getSocket()) {
			room.playerScored(player);
			room.spawn_ball();
		}
	}

	@SubscribeMessage("ballData")
	handleBallPosition(client: Socket, data: any) {
		let room = this.rooms.get(data.room);
		if (client == room.getLeftPlayer().getSocket()) {
			room.setNewBallData(data.ball_x, data.ball_y, data.ball_velocity, data.ball_speed);
		}
	}

	@SubscribeMessage("paddleMovement")
	handlePaddleMovement(client: Socket, data: any) {
		let room = this.rooms.get(data.room);
		let enemy;
		let player;
		if (room.getLeftPlayer().getSocket() == client) {
			enemy = room.getRightPlayer();
			player = room.getLeftPlayer();
		}
		else {
			enemy = room.getLeftPlayer();
			player = room.getRightPlayer();
		}
		room.moveBoth(player, enemy, data);
	}

	@SubscribeMessage("iAmReady")
	handleIAmReady(client: Socket, room_id: string) {
		let room = this.rooms.get(room_id);
		room.validatePlayer(client);
		if (room.isRoomReady() == true) {
			room.getLeftPlayer().getSocket().emit("startTheGame");
			room.getRightPlayer().getSocket().emit("startTheGame");
			room.spawn_ball();
		}
	}
}
