import Phaser from 'phaser';
import { useGameStore } from '@/stores/GameStore';
import { useUserStore } from '@/stores/UserStore';
import { Socket } from 'socket.io-client';
import pongComp from '../components/Game/Pong.vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';

export default class Pong extends Phaser.Scene {
	left_player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
	right_player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
	ball!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
	left_score_txt!: Phaser.GameObjects.Text;
	right_score_txt!: Phaser.GameObjects.Text;
	pattern!: Phaser.GameObjects.Image;
	field!: Phaser.GameObjects.Image;
	pattern_mask!: Phaser.GameObjects.Graphics;
	ball_trail!: Phaser.GameObjects.Particles.ParticleEmitter;
	left_player_trail!: Phaser.GameObjects.Particles.ParticleEmitter;
	right_player_trail!: Phaser.GameObjects.Particles.ParticleEmitter;
	cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	left_collider!: Phaser.Physics.Arcade.Collider;
	right_collider!: Phaser.Physics.Arcade.Collider;
	up!: Phaser.Input.Keyboard.Key;
	down!: Phaser.Input.Keyboard.Key;

	gameStore = useGameStore();
	userStore = useUserStore();
	socket = <Socket>this.gameStore.socket;
	room_id = this.gameStore.room_id;
	old_time = 0;
	width = 1920;
	height = 1080;
	left_paddle_hits_m = 0;
	left_paddle_hits_e = 0;
	right_paddle_hits_m = 0;
	right_paddle_hits_e = 0;
	winning_score = 3;
	next_ball_spawn_left = false;
	next_ball_spawn_right = false;
	paddle_velocity = 16;
	// ball_start_velocity = 1000;
	ball_velocity_scale = 1.1;
	ball_spawn_distance = 6;
	paddle_trail_frequency = 100;
	paddle_trail_alpha = { start: 0.3, end: 0.1 };
	paddle_trail_lifespan = 180;
	ball_trail_frequency = 142;
	ball_trail_alpha = { start: 0.4, end: 0.2 };
	ball_trail_lifespan = 420;
	scoring_increment = 1;
	ball_ingame = false;
	ball_spawn_delay = 2400;
	field_scale = 1;
	left_player_scale = 1;
	right_player_scale = 1;
	ball_scale = 1;
	left_score_scale = 1;
	right_score_scale = 1;
	pattern_scale = 1;
	ball_trail_scale = 1;
	player_trail_scale = 1;
	players_ready = false;
	frame_count = 0;
	ranked = true;
	inputPayload = {
		room: this.room_id,
		up: false,
		down: false,
	};
	router;

	constructor() {
		super("pong");
	}

	preload() {
		const assetsUrl = new URL('../assets/game', import.meta.url);
		this.load.image("field", assetsUrl + "/back.png");
		this.load.image("left_player", assetsUrl + "/paddle.png");
		this.load.image("right_player", assetsUrl + "/paddle.png");
		this.load.image("ball", assetsUrl + "/ball.png");
		this.load.image("pattern", assetsUrl + "/striped_pattern.png");
	}


/********************************** CREATE *************************************/

	create() {
		this.gameStore.setScores(0, 0);
		this.router = useRouter();
		if (this.gameStore.mode == "speed")
			this.paddle_velocity = 32;
		if (this.input.keyboard == undefined)
			console.error("Keyboard is ", this.input.keyboard);
		// this.cursors = this.input.keyboard!.createCursorKeys();
		this.up = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
		this.down = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
		this.pattern_mask = this.add.graphics()
			.fillStyle(0xffffff);

		this.pattern = this.add.image(this.width / 2, this.height / 2, "pattern")
			.setMask(this.pattern_mask.createGeometryMask())
			.setScale(this.pattern_scale);

		this.field = this.add.image(this.width / 2, this.height / 2, "field")
			.setMask(this.pattern.createBitmapMask())
			.setScale(this.field_scale);

		this.left_player = this.physics.add.sprite(this.width * 0.04, this.height / 2, "left_player")
			.setCollideWorldBounds(true)
			.setImmovable(true)
			.setMask(this.pattern.createBitmapMask())
			.setScale(this.left_player_scale);

		this.left_player_trail = this.createPlayerTrail(this.left_player, "left_player");
		this.right_player = this.physics.add.sprite(this.width * 0.96, this.height / 2, "right_player")
			.setCollideWorldBounds(true)
			.setImmovable(true)
			.setMask(this.pattern.createBitmapMask())
			.setScale(this.right_player_scale);

		this.right_player_trail = this.createPlayerTrail(this.right_player, "right_player");
		this.ball = this.physics.add.sprite(this.width / 2, this.height / 2, "ball")
			.setBounce(1)
			.setCollideWorldBounds(true)
			.setMask(this.pattern.createBitmapMask())
			.setScale(this.ball_scale);

		this.ball.alpha = 0;
		this.ball.body.setMaxSpeed(2000);
		this.ball_trail = this.createBallTrail(this.ball, "ball");
		this.left_score_txt = this.add.text(this.width / 3, this.height / 4, String(this.gameStore.left_score), { fontFamily: "ibm-3270", fontSize: "128px",
			shadow: {
				color: '#999',
				blur: 12,
				fill: true,
		} }).setScale(this.left_score_scale);

		this.right_score_txt = this.add.text(2 * this.width / 3 - 64, this.height / 4, String(this.gameStore.right_score), { fontFamily: "ibm-3270", fontSize: "128px",
			shadow: {
				color: '#999',
				blur: 12,
				fill: true,
		} }).setScale(this.right_score_scale);

		this.left_collider = this.physics.add.collider(this.left_player, this.ball, () => this.calcLeft(this.left_player), undefined, this);
		this.right_collider = this.physics.add.collider(this.right_player, this.ball, () => this.calcRight(this.right_player), undefined, this);

		this.socket.on("startTheGame", () => {
			this.players_ready = true;
		});
		this.socket.on("enemyPaddleUp", () => {
			this.right_player.y -= this.paddle_velocity;
		});
		this.socket.on("enemyPaddleDown", () => {
			this.right_player.y += this.paddle_velocity;
		});
		this.socket.on("myPaddleUp", () => {
			this.left_player.y -= this.paddle_velocity;
		});
		this.socket.on("myPaddleDown", () => {
			this.left_player.y += this.paddle_velocity;
		});
		this.socket.on("newScore", (left_score, right_score) => {
			this.gameStore.setScores(left_score, right_score);
			this.left_score_txt.text = String(this.gameStore.left_score);
			this.right_score_txt.text = String(this.gameStore.right_score);
			if (this.gameStore.left_score == this.winning_score || this.gameStore.right_score == this.winning_score) {
				this.socket.emit("endGame", { left_e: this.left_paddle_hits_e, left_m: this.left_paddle_hits_m, right_e: this.right_paddle_hits_e, right_m: this.right_paddle_hits_m, room_id: this.room_id });
			}
		});
		this.socket.on("destroyGame", (paddle_hits_e, paddle_hits_m) => {
			console.log("winning score!");
			this.gameStore.socket!.emit("setGameDataAndRoute", { intra: this.gameStore.intra, player: this.userStore.username, enemy: this.gameStore.enemy_name, player_score: this.gameStore.left_score, enemy_score: this.gameStore.right_score, ranked: (this.gameStore.mode == ""), paddle_hits_e: paddle_hits_e, paddle_hits_m: paddle_hits_m, room_id: this.room_id });
			this.game.destroy(true);
		});

		this.socket.on("spawnBall", (y_position, x_velocity, y_velocity) => {
			if (this.gameStore.mode != "")
			{
				x_velocity = 2000;
				y_velocity *= 4;
				this.ranked = false;
			}
			this.ball.setPosition(this.width / 2, y_position);
			this.ball.setVelocity(x_velocity, y_velocity);
			this.ball.alpha = 1;
			this.ball_trail.start();
			this.ball_ingame = true;
		})
		this.socket.on("newBallData", (x, y, velocity, speed) => {
				x = this.width / 2 - (x - this.width / 2);
			this.ball.setPosition(x, y);
			this.ball.body.velocity.x = velocity.x * -1;
			this.ball.body.velocity.y = velocity.y;
		})
		this.socket.emit("iAmReady", this.room_id);
	}


/********************************** UPDATE *************************************/

	update(time: number, delta: number): void {
		if (this.players_ready == false)
			return;

		/*  Movement  */
		this.inputPayload.up = this.up.isDown;
		this.inputPayload.down = this.down.isDown;
		if (this.inputPayload.up || this.inputPayload.down)
			this.socket.emit("paddleMovement", this.inputPayload);

		/*  Scoring condition  */
		if (this.ball.body.onWall() && this.left_player.body.touching.none && this.right_player.body.touching.none && this.gameStore.mode != "dodge") {
			this.player_scored();
			this.old_time = time;
		}

		/*  Spawning in the ball after delay  */
		if (!this.ball_ingame) {
			if (this.old_time + this.ball_spawn_delay > time)
			return;
			this.ball_ingame = true;
		}
		// this.frame_count++;
		// if (this.frame_count > 5) {
		// 	this.frame_count -= 5;
			this.socket.emit("ballData", {ball_x: this.ball.x, ball_y: this.ball.y, ball_velocity: this.ball.body.velocity, ball_speed: this.ball.body.speed, room: this.room_id})
		// }
	}


/********************************* METHODS *************************************/

	calcLeft(player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody){
		if (this.gameStore.mode == "dodge")
		{
			this.socket.emit('scoreRequest', {left_player_scored: false, room: this.room_id});
			this.ball_ingame = false;
			this.ball.setVelocity(0);
			this.ball.setPosition(this.width / 2, this.height / 2);
			this.ball_trail.stop();
			this.ball.alpha = 0;
		}
		else
			this.calculateRebound(player);
	}

	calcRight(player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody){
		if (this.gameStore.mode == "dodge")
		{
			this.socket.emit('scoreRequest', {left_player_scored: true, room: this.room_id});
			this.ball_ingame = false;
			this.ball.setVelocity(0);
			this.ball.setPosition(this.width / 2, this.height / 2);
			this.ball_trail.stop();
			this.ball.alpha = 0;
		}
		else
			this.calculateRebound(player);
	}

	calculateRebound(player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
		if (this.gameStore.mode == "dodge")
		{
			this.player_scored(player.name);
			return ;
		}
		let distance = Phaser.Math.Distance.Between(1, player.y, 1, this.ball.y);
		let angle = 0;
		if (distance > 128)
			angle = 60;
		else if (distance > 96)
			angle = 45;
		else if (distance > 64)
			angle = 30;
		else if (distance > 32)
			angle = 15;
		if (angle === 0) {
			if (player === this.left_player)
			{
				this.left_paddle_hits_m++;
				// console.log(player + 's paddle_hits_m: ' + this.paddle_hits_m)
			}
			else if (player === this.right_player)
			{
				this.right_paddle_hits_m++;
			}
		}
		else {
			if (player === this.left_player)
			{
				this.left_paddle_hits_e++;
				// console.log(player + 's paddle_hits_e: ' + this.paddle_hits_e)
			}
			else if (player === this.right_player)
			{
				this.right_paddle_hits_e++;
			}
		}
		if ((player.y > this.ball.y && this.ball.x < this.width / 2) || player.y < this.ball.y && this.ball.x > this.width / 2)
			angle *= -1;
		if (this.ball.x > this.width / 2)
			angle += 180;
		this.physics.velocityFromAngle(angle, this.ball.body.speed, this.ball.body.velocity);
		this.ball.body.velocity.scale(this.ball_velocity_scale);
	}

	player_scored() {
		if (this.gameStore.left_score == this.winning_score || this.gameStore.right_score == this.winning_score)
			return;
		let left_player_scored = false;
		if (this.ball.body.blocked.right)
			left_player_scored = true;
		this.socket.emit('scoreRequest', {left_player_scored: left_player_scored, room: this.room_id});
		/* ending game in 'newScore' listener now */

		this.ball_ingame = false;
		this.ball.setVelocity(0);
		this.ball.setPosition(this.width / 2, this.height / 2);
		this.ball_trail.stop();
		this.ball.alpha = 0;
	}

	createPlayerTrail(sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, key: string) {
		return (
			this.add.particles(0, 0, key, {
				follow: sprite,
				frequency: this.paddle_trail_frequency,
				alpha: this.paddle_trail_alpha,
				lifespan: this.paddle_trail_lifespan,
				scale: this.player_trail_scale,
			}).setMask(this.pattern.createBitmapMask()).start()
		);
	}

	createBallTrail(sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, key: string) {
		return (
			this.add.particles(0, 0, key, {
				follow: sprite,
				frequency: this.ball_trail_frequency,
				alpha: this.ball_trail_alpha,
				lifespan: this.ball_trail_lifespan,
				scale: this.ball_trail_scale,
			}).setMask(this.pattern.createBitmapMask()).stop()
			);
		}
}
