import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Users } from '../user/user.service';
import { SubscribeMessage } from '@nestjs/websockets';

@Injectable()
export class GameService {
	constructor( readonly users: Users ) {}
}

export class Player {
	constructor(
		private readonly socket: Socket,
		private readonly intraname: string,
		private readonly users: Users,
	){}

	private username: string;
	private picture: string;
	private score: number;

	async updateUserData() {
		this.username = await this.users.getUsernameByIntra(this.intraname);
		this.picture = await this.users.getAvatarByIntra(this.intraname);
		this.score = await this.users.getScore(this.intraname);
	}

	getSocket(): Socket { return this.socket; }
	getIntraname(): string { return this.intraname; }
	getUsername(): string { if (this.username == undefined) this.updateUserData(); return this.username; }
	getPicture(): string { if (this.picture == undefined) this.updateUserData(); return this.picture; }
	getScore(): number { if (this.score == undefined) this.updateUserData(); return this.score; }
}

export class Room {
	constructor(
		private readonly room_id: string,
		private 		 left_player: Player,
		private 		 right_player: Player,
	){}

	private left_player_status = false;
	private right_player_status = false;

	/*  game state  */
	private left_score: number = 0;
	private right_score: number = 0;
	private ball_x: number = 0;
	private ball_y: number = 0;
	private left_player_y: number = 0;
	private right_player_y: number = 0;

	getRoomId(): string { return this.room_id; }
	getLeftPlayer(): Player { return this.left_player; }
	getRightPlayer(): Player { return this.right_player; }

//	setupListeners() {
//		console.log("Method setupListeners in room class was called");
//		this.left_player.getSocket().on("enemyPaddleMovement", () => {
//			console.log("Room listener 'enemyPaddleMovement' fired");
//			console.log("Room class listener 'enemyPaddleMovement' was fired with client:", client.id, "and with payload:", inputPayload);
//			let currentPlayer;
//			if (client == this.left_player.getSocket())
//				currentPlayer = this.left_player.getIntraname();
//			else
//				currentPlayer = this.right_player.getIntraname();
//			console.log("Room listener 'enemyPaddleMovement' fired because of", currentPlayer, "with the payload", inputPayload);
//			if (client == this.left_player.getSocket()) {
//				if (inputPayload.up == true){
//					this.right_player.getSocket().emit("enemyPaddleUp");
//					console.log("Room emitting 'enemyPaddleUp from", currentPlayer, "to", this.right_player.getIntraname(), "with payload:", inputPayload);
//				}
//				else if (inputPayload.down == true) {
//					this.right_player.getSocket().emit("enemyPaddleDown");
//					console.log("Room emitting 'enemyPaddleDown from", currentPlayer, "to", this.right_player.getIntraname(), "with payload:", inputPayload);
//				}
//			} else {
//				if (inputPayload.up == true) {
//					this.left_player.getSocket().emit("enemyPaddleUp");
//					console.log("Room emitting 'enemyPaddleUp from", currentPlayer, "to", this.left_player.getIntraname(), "with payload:", inputPayload);
//				}
//				else if (inputPayload.down == true) {
//					this.left_player.getSocket().emit("enemyPaddleDown");
//					console.log("Room emitting 'enemyPaddleDown from", currentPlayer, "to", this.left_player.getIntraname(), "with payload:", inputPayload);
//				}
//			}
//		});
//	}

	movePlayer(player: Player, inputPayload: any) {
		if (inputPayload.up == true)
			player.getSocket().emit('enemyPaddleUp');
		else if (inputPayload.down == true)
			player.getSocket().emit('enemyPaddleDown');
	}
	
	isRoomReady(): boolean {
		if (this.left_player_status && this.right_player_status)
			return true;
		return false;
	}

	validatePlayer(client: Socket) {
		if (client == this.left_player.getSocket())
			this.left_player_status = true;
		else if (client == this.right_player.getSocket())
			this.right_player_status = true;
	}
}