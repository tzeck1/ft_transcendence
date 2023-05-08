import Phaser from 'phaser';
import { useGameStore } from '@/stores/GameStore';
import { Socket } from 'socket.io-client';

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

	gameStore = useGameStore();
	socket = <Socket>this.gameStore.socket;
	room_id = this.gameStore.room_id;
	old_time = 0;
	width = 1920;
	height = 1080;
	left_score = 0;
	right_score = 0;
	winning_score = 11;
	next_ball_spawn_left = false;
	next_ball_spawn_right = false;
	paddle_velocity = 16;
	ball_start_velocity = 400;
	ball_velocity_scale = 1.1;
	ball_spawn_distance = 6;
	paddle_trail_frequency = 142;
	paddle_trail_alpha = { start: 0.4, end: 0.2 };
	paddle_trail_lifespan = 420;
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
	inputPayload = {
		up: false,
		down: false,
	};

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
		if (this.input.keyboard == undefined)
			console.error("Keyboard is ", this.input.keyboard);
		this.cursors = this.input.keyboard!.createCursorKeys();
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
		this.ball.body.setMaxSpeed(2400);
		this.ball_trail = this.createBallTrail(this.ball, "ball");
		this.left_score_txt = this.add.text(this.width / 3, this.height / 4, String(this.left_score), { fontFamily: "ibm-3270", fontSize: "128px",
			shadow: {
				color: '#999',
				blur: 12,
				fill: true,
		} }).setScale(this.left_score_scale);

		this.right_score_txt = this.add.text(2 * this.width / 3 - 64, this.height / 4, String(this.right_score), { fontFamily: "ibm-3270", fontSize: "128px",
			shadow: {
				color: '#999',
				blur: 12,
				fill: true,
		} }).setScale(this.right_score_scale);

		this.left_collider = this.physics.add.collider(this.left_player, this.ball, () => this.calculateRebound(this.left_player), undefined, this);
		this.right_collider = this.physics.add.collider(this.right_player, this.ball, () => this.calculateRebound(this.right_player), undefined, this);

		this.socket.on("startTheGame", () => {
			this.players_ready = true;
		});
		this.socket.on("enemyPaddleUp", () => {
			this.right_player.y -= this.paddle_velocity;
		});
		this.socket.on("enemyPaddleDown", () => {
			this.right_player.y += this.paddle_velocity;
		});
		this.socket.emit("iAmReady", this.room_id);
	}


/********************************** UPDATE *************************************/

	update(time: number, delta: number): void {
		if (this.players_ready == false)
			return;

		/*  Movement  */
		this.inputPayload.up = this.cursors.up.isDown;
		this.inputPayload.down = this.cursors.down.isDown;
		this.socket.emit("paddleMovement", this.room_id, this.inputPayload);
		if (this.inputPayload.up)
			this.left_player.y -= this.paddle_velocity;
		else if (this.inputPayload.down)
			this.left_player.y += this.paddle_velocity;

		/*  Scoring condition  */
		if (this.ball.body.onWall() && this.left_player.body.touching.none && this.right_player.body.touching.none) {
			this.player_scored();
			this.old_time = time;
		}

		/*  Spawning in the ball after delay  */
		if (!this.ball_ingame) {
			if (this.old_time + this.ball_spawn_delay > time)
				return;
			this.spawn_ball();
		}
	}


/********************************* METHODS *************************************/

	calculateRebound(player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
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
		if ((player.y > this.ball.y && this.ball.x < this.width / 2) || player.y < this.ball.y && this.ball.x > this.width / 2)
			angle *= -1;
		if (this.ball.x > this.width / 2)
			angle += 180;
		this.physics.velocityFromAngle(angle, this.ball.body.speed, this.ball.body.velocity);
		this.ball.body.velocity.scale(this.ball_velocity_scale);
	}

	player_scored() {
		if (this.left_score == this.winning_score || this.right_score == this.winning_score)
			return;
		if (this.ball.body.blocked.left) {
			this.right_score += this.scoring_increment;
			this.right_score_txt.text = String(this.right_score);
			this.next_ball_spawn_right = true;
		}
		else if (this.ball.body.blocked.right) {
			this.left_score += this.scoring_increment;
			this.left_score_txt.text = String(this.left_score);
			this.next_ball_spawn_left = true;
		}
		if (this.left_score == this.winning_score || this.right_score == this.winning_score) {
			this.left_collider.destroy();
			this.right_collider.destroy();
			this.left_player_trail.destroy();
			this.right_player_trail.destroy();
			this.left_player.alpha = 0;
			this.right_player.alpha = 0;
			// TODO end game here
		}
		this.ball_ingame = false;
		this.ball.setVelocity(0);
		this.ball.setPosition(this.width / 2, this.height / 2);
		this.ball_trail.stop();
		this.ball.alpha = 0;
	}

	spawn_ball() {
		let x: number, y: number;

		if (Phaser.Math.Between(0, 1) == 0)
			y = Phaser.Math.Between(0, this.height / this.ball_spawn_distance);
		else
			y = Phaser.Math.Between((this.ball_spawn_distance - 1) * this.height / this.ball_spawn_distance, this.height);
		this.ball.setPosition(this.width / 2, y);
		if (y > this.height / 2)
			y = Phaser.Math.Between(-0.5 * this.ball_start_velocity, -1.5 * this.ball_start_velocity);
		else
			y = Phaser.Math.Between(0.5 * this.ball_start_velocity, 1.5 * this.ball_start_velocity);
		if (this.next_ball_spawn_left)
			x = this.ball_start_velocity;
		else if (this.next_ball_spawn_right)
			x = this.ball_start_velocity * -1;
		else {
			if (Phaser.Math.Between(0, 1) == 0)
				x = this.ball_start_velocity * -1;
			else
				x = this.ball_start_velocity;
		}
		this.ball.setVelocity(x, y);
		this.next_ball_spawn_left = false;
		this.next_ball_spawn_right = false;
		this.ball.alpha = 1;
		this.ball_trail.start();
		this.ball_ingame = true;
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
