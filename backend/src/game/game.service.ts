import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Users } from '../user/user.service';

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
		private readonly phaser_config: Phaser.Types.Core.GameConfig,
		private 		 left_player: Player,
		private 		 right_player: Player,
	){}

	private phaser_instance: Phaser.Game;

	getRoomId(): string { return this.room_id; }
	getPhaserConfig(): Phaser.Types.Core.GameConfig { return this.phaser_config; }
	getPhaserInstance(): Phaser.Game { return this.phaser_instance; }
	getLeftPlayer(): Player { return this.left_player; }
	getRightPlayer(): Player { return this.right_player; }
}