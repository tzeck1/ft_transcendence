import Phaser, { Game } from 'phaser';

export default class Start extends Phaser.Scene
{
	private width = 1920;
	private height = 1080;
	private ball!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
	private pattern!: Phaser.GameObjects.Image;
	private field!: Phaser.GameObjects.Image;
	private maskPattern!: Phaser.GameObjects.Graphics;
	private ball_trail!: Phaser.GameObjects.Particles.ParticleEmitter;
	private start_button!: Phaser.GameObjects.Image;

	constructor()
	{
		super("start");
	}

	preload()
	{
		this.load.image("back", "./assets/back.png");
		this.load.image("player", "./assets/paddle.png");
		this.load.image("enemy", "./assets/paddle.png");
		this.load.image("ball", "./assets/ball.png");
		this.load.image("pattern", "./assets/striped_pattern.png");
		this.load.image("gray", "./assets/gray.png");
		this.load.image("title", "./assets/pong.png");
		this.load.image("start_button", "./assets/start.png");
		this.load.image("settings_button", "./assets/settings.png");
	}

	create()
	{
		this.pattern = this.add.image(this.width / 2, this.height / 2, "pattern");
		this.maskPattern = this.add.graphics();
		this.maskPattern.fillStyle(0xffffff);
		this.pattern.setMask(this.maskPattern.createGeometryMask());
		this.field = this.add.image(this.width / 2, this.height / 2, "back");
		this.field.setMask(this.pattern.createBitmapMask());

		this.ball = this.physics.add.sprite(this.width / 2, this.height / 2, "ball");
		this.ball.setBounce(1);
		this.ball.setCollideWorldBounds(true);
		this.ball.setMask(this.pattern.createBitmapMask());
		this.spawn_ball();
		this.ball_trail = this.add.particles("ball").createEmitter({
			follow: this.ball,
			frequency: 142,
			alpha: {start: 0.4, end: 0.2},
			lifespan: 420
		})
		this.ball_trail.setMask(this.pattern.createBitmapMask());
		this.ball_trail.start();

		this.add.image(this.width / 2, this.height / 2, "gray");
		this.add.image(this.width / 2, this.height / 3, "title");
		this.start_button = this.add.image(this.width / 3, 2 * this.height / 3, "start_button").setScale(0.5);
		this.add.image(2 * this.width / 3, 2 * this.height / 3, "settings_button").setScale(0.5);
		this.start_button.setInteractive().on("pointerdown", this.onClick, this);
		
	}

	onClick()
	{
		this.scene.start("pong");
	}

	spawn_ball()
	{
		let x = this.width / 2;
		let y;
		if (Phaser.Math.Between(0, 1) == 0)
			y = Phaser.Math.Between(0, this.height / 6);
		else
			y = Phaser.Math.Between(5 * this.height / 6, this.height);
		this.ball.setPosition(x, y);
		if (y > this.height / 2)
			y = Phaser.Math.Between(-200, -600);
		else
			y = Phaser.Math.Between(200, 600);
		if (Phaser.Math.Between(0, 1) == 0)
			x = -400;
		else
			x = 400;
		this.ball.setVelocity(x, y);
	}
}