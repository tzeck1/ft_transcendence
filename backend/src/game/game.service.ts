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
	private left_score_status = false;
	private right_score_status = false;

	/*  game state  */
	private left_score: number = 0;
	private right_score: number = 0;
	private ball_x: number = 0;
	private ball_y: number = 0;
	private left_player_y: number = 0;
	private right_player_y: number = 0;
	private height: number = 1080;
	private width: number = 1920;
	private ball_start_velocity: number = 400;
	private ball_spawn_distance: number = 6;
	private next_ball_spawn_left: boolean = false;
	private next_ball_spawn_right: boolean = false;

	getRoomId(): string { return this.room_id; }
	getLeftPlayer(): Player { return this.left_player; }
	getRightPlayer(): Player { return this.right_player; }

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

	isScoreTrue(): boolean {
		if (this.left_score_status && this.right_score_status)
			return true;
		return false;
	}

	validatePlayer(client: Socket) {
		if (client == this.left_player.getSocket())
			this.left_player_status = true;
		else if (client == this.right_player.getSocket())
			this.right_player_status = true;
	}

	validateScore(client: Socket) {
		if (client == this.left_player.getSocket())
			this.left_score_status = true;
		else if (client == this.right_player.getSocket())
			this.right_score_status = true;
	}

	spawn_ball() {
		let x: number, y: number, p: number;
		console.log("spawnball was called");

		if (Math.random() < 0.5)
			p = Math.random() * (this.height / this.ball_spawn_distance);
		else
			p = Math.random() * (this.height / this.ball_spawn_distance) + ((this.ball_spawn_distance - 1) * this.height / this.ball_spawn_distance)
		if (p > this.height / 2)
			y = (Math.random() - 1.5) * this.ball_start_velocity;
		else
			y = (Math.random() + 0.5) * this.ball_start_velocity;
		if (this.next_ball_spawn_left)
			x = this.ball_start_velocity * -1;
		else if (this.next_ball_spawn_right)
			x = this.ball_start_velocity;
		else {
			if (Math.random() < 0.5)
				x = this.ball_start_velocity * -1;
			else
				x = this.ball_start_velocity;
		}
		this.left_player.getSocket().emit('spawnBall', p, x, y);
		this.right_player.getSocket().emit('spawnBall', p, x * -1, y);
	}

	playerScored(player: Player) {
		console.log("playerScored was called from", player.getIntraname());
		if (player == this.left_player)
			console.log("He was true left player");
		else
			console.log("He was NOT the true left player");
		if (this.left_player == player)
			this.left_score++;
		else
			this.right_score++;
		this.left_player.getSocket().emit('newScore', this.left_score, this.right_score);
		this.right_player.getSocket().emit('newScore', this.right_score, this.left_score);
		this.left_score_status = false;
		this.right_score_status = false;
	}
}