import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Users } from '../user/user.service';
import prisma from 'src/prisma';
import { SubscribeMessage } from '@nestjs/websockets';

@Injectable()
export class Games {
	constructor( readonly users: Users ) {}
}

export class Player {
	constructor(
		private readonly socket: Socket,
		private readonly intraname: string,
		private readonly users: Users,
		private readonly mode: string = "",
		private readonly opponent: string = "",
	){}

	private username: string;
	private picture: string;
	private rank: number;

	async updateUserData() {
		this.username = await this.users.getUsernameByIntra(this.intraname);
		this.picture = await this.users.getAvatarByIntra(this.intraname);
		this.rank = await this.users.getRank(this.intraname);
	}

	getSocket(): Socket { return this.socket; }
	getIntraname(): string { return this.intraname; }
	getMode(): string { return this.mode; }
	getOpponent(): string { return this.opponent; }
	getUsername(): string { if (this.username == undefined) this.updateUserData(); return this.username; }
	getPicture(): string { if (this.picture == undefined) this.updateUserData(); return this.picture; }
	getRank(): number { this.updateUserData(); return this.rank; }// TODO check if the if condition should be removed here
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

	moveBoth(player: Player, enemy: Player, inputPayload: any) {
		let player_socket = player.getSocket();
		let enemy_socket = enemy.getSocket();

		if (inputPayload.up == true) {
			player_socket.emit('myPaddleUp');
			enemy_socket.emit("enemyPaddleUp");
		}
		else if (inputPayload.down == true) {
			player_socket.emit('myPaddleDown');
			enemy_socket.emit("enemyPaddleDown");
		}
	}

	setNewBallData(x: number, y: number, velocity: any, speed: number) {
		this.right_player.getSocket().emit('newBallData', x, y, velocity, speed);
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

	// TODO probably gone when instant enemy win
	invalidatePlayer(player: string) {
		if (player == "left")
			this.left_player_status = false;;
		if (player == "right")
			this.right_player_status = false;
		// Can use this here to do stuff when a player left the game
	}

	validateScore(client: Socket) {
		if (client == this.left_player.getSocket())
			this.left_score_status = true;
		else if (client == this.right_player.getSocket())
			this.right_score_status = true;
	}

	spawn_ball() {
		let x: number, y: number, p: number;
		// console.log("spawnball was called");

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
		// console.log("playerScored was called from", player.getIntraname());
		// if (player == this.left_player)
			// console.log("He was true left player");
		// else
			// console.log("He was NOT the true left player");
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

@Injectable()
export class Game {

	calculateNewRank(rank1: number, rank2: number, win: number): number {
		if (rank1 == -1 || rank2 == -1)
			return 1;
		let new_rank;

		new_rank = rank1 + 50 * (win - this.calculateExpect(rank1, rank2));

		console.log("calculateNewRank called with rank1:", rank1, "rank2:", rank2, "and win:", win, "new Rank is:", new_rank);
		return new_rank;
	}

	calculateExpect(rank1: number, rank2: number) {
		let expect = (1 / (1 + (10 ** ((rank2 - rank1) / 400))));
		console.log("calculateExpect called with rank1:", rank1, "rank2:", rank2, "expect is:", expect);
		return expect;
	}

	/*	========== SETTER ==========	*/
	async setGameData(intra: string, player: string, enemy: string, player_score: number, enemy_score: number, ranked: boolean, paddle_hits_e: number, paddle_hits_m: number) {
		if (ranked == false)
			return;
		const newUsersEntry = await prisma.games.create( {
			data: {
				intra:				intra,
				player:				player,
				enemy:				enemy,
				player_score:		player_score,
				enemy_score:		enemy_score,
				ranked:				ranked,
				date:				new Date(),
				paddle_hits_e:		paddle_hits_e,
				paddle_hits_m:		paddle_hits_m,
			},
		});
		if (player_score > enemy_score) {
			console.log("user won!");
			await prisma.users.update({
				where: {
					intra_name: intra,
				},
				data: {
					rank: Math.round(this.calculateNewRank(await this.getUserRankByUsername(player),
												await this.getUserRankByUsername(enemy), 1)),
					games_won: { increment: 1 }
				}
			})
		}
		else if (player_score < enemy_score) {
			console.log("user lost!");
			const user = await prisma.users.findUnique({
				where: {
				  intra_name: intra,
				},
			});
			if (user && user.rank > 0) {
				await prisma.users.update({
					where: {
						intra_name: intra,
					},
					data: {
						rank: Math.round(this.calculateNewRank(await this.getUserRankByUsername(player),
													await this.getUserRankByUsername(enemy), 0)),
						games_lost: { increment: 1 }
					}
				})
			}
		}
		await prisma.users.update({
			where: {
				intra_name: intra,
			},
			data: {
				games_played: { increment: 1}
			}
		})
	}

	/*	========== GETTER ==========	*/
	async getLastGame(intra: string) {
		const latestGame = await prisma.games.findFirst({
			where: {
				intra: intra,
			},
			orderBy: {
				date: 'desc',
			},
		});
		return latestGame;
	}

	async getUserGames(intra: string) {
		const userGames = await prisma.games.findMany({
			where: {
				intra: intra,
			},
			orderBy: {
				date: 'desc',
			},
		});

		userGames.forEach(game => {
			(game as any).formattedDate = formatDate(game.date);
		});

		return userGames;
	}

	async getUserGamesAsc(intra: string) {
		const userGames = await prisma.games.findMany({
			where: {
				intra: intra,
			},
			orderBy: {
				date: 'asc',
			},
		});

		userGames.forEach(game => {
			(game as any).formattedDate = formatDate(game.date);
		});

		return userGames;
	}

	async getUserRankByUsername(username: string) {
		const user = await prisma.users.findUnique({
			where: {
				username: username,
			},
		});
		if (user == undefined || user == null)
			return (-1);
		return user.rank;
	}

}

function formatDate(date: Date) {
	const day = date.getDate();
	const month = date.getMonth() + 1;
	const year = date.getFullYear().toString().substr(-2);

	return `${day}/${month}/${year}`;
}