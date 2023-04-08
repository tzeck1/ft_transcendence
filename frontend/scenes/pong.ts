import Phaser, { Game } from 'phaser';

export default class Pong extends Phaser.Scene
{
	private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
	private enemy!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
	private ball!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
	private score1_text!: Phaser.GameObjects.Text;
	private score2_text!: Phaser.GameObjects.Text;
	private score1 = 0;
	private score2 = 0;
	private on_paddle = false;
	private width = 1920;
	private height = 1080;
	private pattern!: Phaser.GameObjects.Image;
	private maskPattern!: Phaser.GameObjects.Graphics;
	private field!: Phaser.GameObjects.Image;
	private player_scored = false;
	private enemy_scored = false;
	private ball_trail!: Phaser.GameObjects.Particles.ParticleEmitter;
	private player_trail!: Phaser.GameObjects.Particles.ParticleEmitter;
	private enemy_trail!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor()
  {
    super("pong");
  }

  create()
  {

	this.pattern = this.add.image(this.width / 2, this.height / 2, "pattern");
	this.maskPattern = this.add.graphics();
	this.maskPattern.fillStyle(0xffffff);
	this.pattern.setMask(this.maskPattern.createGeometryMask());
	this.field = this.add.image(this.width / 2, this.height / 2, "back");
	this.field.setMask(this.pattern.createBitmapMask());

	this.player = this.physics.add.sprite(this.width * 0.04, this.height / 2, "player").setCollideWorldBounds(true);
	this.enemy = this.physics.add.sprite(this.width * 0.96, this.height / 2, "enemy").setCollideWorldBounds(true);
	this.player.setImmovable(true);
	this.enemy.setImmovable(true);
	this.player.setMask(this.pattern.createBitmapMask());
	this.enemy.setMask(this.pattern.createBitmapMask());

	this.ball = this.physics.add.sprite(this.width / 2, this.height / 2, "ball");
	this.ball.setBounce(1);
	this.ball.setCollideWorldBounds(true);
	this.ball.setMask(this.pattern.createBitmapMask());
	this.spawn_ball();

	this.physics.add.collider(this.player, this.ball, this.hit_paddle, undefined, this);
	this.physics.add.collider(this.enemy, this.ball, this.hit_paddle, undefined, this);

	this.score1_text = this.add.text(this.width / 3, this.height / 4, '0', { fontFamily: "ibm-3270", fontSize: "128px" });
	this.score2_text = this.add.text(2 * this.width / 3 - 64, this.height / 4, '0', { fontFamily: "ibm-3270", fontSize: "128px" });

	this.ball_trail = this.add.particles("ball").createEmitter({
		follow: this.ball,
		frequency: 142,
		alpha: {start: 0.4, end: 0.2},
		lifespan: 420
	})
	this.ball_trail.setMask(this.pattern.createBitmapMask());
	this.ball_trail.start();
	this.player_trail = this.add.particles("player").createEmitter({
		follow: this.player,
		frequency: 142,
		alpha: {start: 0.4, end: 0.2},
		lifespan: 420
	})
	this.player_trail.setMask(this.pattern.createBitmapMask());
	this.player_trail.start();
	this.enemy_trail = this.add.particles("enemy").createEmitter({
		follow: this.enemy,
		frequency: 142,
		alpha: {start: 0.4, end: 0.2},
		lifespan: 420
	})
	this.enemy_trail.setMask(this.pattern.createBitmapMask());
	this.enemy_trail.start();
  }

  update()
  {
	const cursors = this.input.keyboard.createCursorKeys();
    if (cursors.up.isDown)
	{
		this.player.setVelocityY(-800);
		this.enemy.setVelocityY(-800);
	}
	else if (cursors.down.isDown)
	{
		this.player.setVelocityY(800);
		this.enemy.setVelocityY(800);
	}
	else
	{
		this.player.setVelocityY(0);
		this.enemy.setVelocityY(0);
	}
	if (this.ball.body.onWall() && !this.on_paddle)
		this.scored();
	this.on_paddle = false;
  }

  hit_paddle() // not the best solution to check if it hits the world borders
  {
	let distance = Phaser.Math.Distance.Between(1, this.player.y, 1, this.ball.y);
	let angle = 0;
	if (distance > 96)
		angle = 45;
	else if (distance > 64)
		angle = 30;
	else if (distance > 32)
		angle = 15;
	if ((this.player.y > this.ball.y && this.ball.x < this.width / 2) || this.player.y < this.ball.y && this.ball.x > this.width / 2)
		angle *= -1;
	if (this.ball.x > this.width / 2)
		angle += 180;
  	this.physics.velocityFromAngle(angle, this.ball.body.speed, this.ball.body.velocity);
	this.ball.body.velocity.scale(1.1);
	this.on_paddle = true;
  }

  scored()
  {
	if (this.ball.body.blocked.right)
	{
		this.score1_text.text = String(++this.score1);
		this.player_scored = true;
	}
	else
	{
		this.score2_text.text = String(++this.score2);
		this.enemy_scored = true;
	}
	if (this.score1 == 11 || this.score2 == 11)
		this.scene.start("end");
	this.spawn_ball();
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
	if (this.player_scored)
		x = 400;
	else if (this.enemy_scored)
		x = -400;
	else
	{
		if (Phaser.Math.Between(0, 1) == 0)
			x = -400;
		else
			x = 400;
	}
	this.ball.setVelocity(x, y);
	this.player_scored = false;
	this.enemy_scored = false;
	return function(){};
  }
}