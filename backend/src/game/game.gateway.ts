import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Games, Room, Player } from './game.service';
import { Users } from '../user/user.service';

@WebSocketGateway({
	namespace: '/game_socket',
	cors: {
		origin: '*',
	},
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(private readonly games: Games, private readonly users: Users) {}

	//		key: room_id
	private rooms: Map<string, Room> = new Map<string, Room>;

	//		key: intraname
	private lobby: Map<string, Player> = new Map<string, Player>;

	private invite_array: [string, string, Player][] = new Array<[string, string, Player]>;

	private room_counter = 0;
	private threshold = 20;

	@WebSocketServer() server: Server;

	afterInit(server: Server) {
		console.log('Game Initialized');
		//create a lobby socket.io room
	}

	handleDisconnect(client: Socket) {
		console.log(`Game Client Disconnected: ${client.id}`);
		// TODO probably can delete this after instant enemy win when leaving
		for (let [room_id, room] of this.rooms) {// if the game socket that disconnected was in a room, set this room's player status to false
			if (room.getLeftPlayer().getSocket().id == client.id) {
				room.invalidatePlayer("left");
				room.getLeftPlayer().getSocket().emit("setIngameStatus", false);
			}
			if (room.getRightPlayer().getSocket().id == client.id) {
				room.invalidatePlayer("right");
				room.getRightPlayer().getSocket().emit("setIngameStatus", false);

			}
		}
	}

	handleConnection(client: Socket, ...args: any[]) {
		console.log(`Game Client Connected: ${client.id}`);
	}

	@SubscribeMessage("invitePlay")
	handleInvitePlay(client: Socket, ...args: any[]) {
		// console.log("event 'invitePlay' was triggered. I am", client.id);
		let intra = args[0].intra;
		let other_intra = args[0].other_intra;
		let player = new Player(client, intra, this.users);
		let other_player = this.searchInviteArray(intra, other_intra);
		if (other_player != undefined) {// This is executed when the second player gets into handleInvitePlay
			player.updateUserData();
			other_player.updateUserData();
			let index = this.invite_array.indexOf([other_intra, intra, other_player]);
			if (index == -1)
				index = this.invite_array.indexOf([intra, other_intra, other_player]);
			if (index == -1)
				console.log("Error in handleInvitePlay due to invalid return from indexOf (invite_array)", other_player.getSocket().id);
			this.invite_array.splice(index, 1);
			this.room_counter += 1;
			let room_id = "game" + this.room_counter.toString();
			let room = new Room(room_id, player, other_player);
			this.rooms.set(room_id, room);
			player.getSocket().join(room_id);
			other_player.getSocket().join(room_id);
			player.getSocket().emit("privatePlayReady", other_player.getUsername(), other_player.getPicture(), room_id);
			other_player.getSocket().emit("privatePlayReady", player.getUsername(), player.getPicture(), room_id);
		} else // This is executed when the first player gets into handleInvitePlay
			this.invite_array.push([args[0].intra, args[0].other_intra, player]);
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

	@SubscribeMessage("createOrJoinMode")
	async handleCreateOrJoinMode(client: Socket, data: any) {
		let searching_player = new Player(client, data[0], this.users, data[1]);
		await searching_player.updateUserData();
		for (let [intraname, lobby_player] of this.lobby) {
			if (searching_player.getMode() == lobby_player.getMode()) {
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
		let searching_player = new Player(client, intra, this.users);
		await searching_player.updateUserData();
		for (let [intraname, lobby_player] of this.lobby) {
			if (lobby_player.getMode() == "" && lobby_player.getScore() - this.threshold < searching_player.getScore() && searching_player.getScore() < lobby_player.getScore() + this.threshold) {
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
		let player = this.lobby.get(intra);
		client.leave("lobby");
		this.lobby.delete(player.getIntraname());
		//client.disconnect(true);
	}

	@SubscribeMessage("scoreRequest")
	handleScoreRequest(client: Socket, data: any) {
		console.log(client.id, "sends", data.left_player_scored, "and", data.room)
		let room = this.rooms.get(data.room);
		let player;
		if (data.left_player_scored == true/*client == room.getLeftPlayer().getSocket()*/)
			player = room.getLeftPlayer();
		else
			player = room.getRightPlayer();
		room.validateScore(client);
		if (/*room.isScoreTrue() == true*/client == room.getLeftPlayer().getSocket()) {
			console.log("inside if of isScoreTrue was called");
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
