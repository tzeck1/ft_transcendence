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

  constructor()
  {
    super("pong");
  }

  preload()
  {
    this.load.image("back", "./assets/Back.png");
    this.load.image("player", "./assets/Player.png");
    this.load.image("enemy", "./assets/Enemy.png");
    this.load.image("ball", "./assets/Ball.png");
  }

  create()
  {
	this.add.image(800, 455, "back").scale = 2;

	this.player = this.physics.add.sprite(8.5, 450, "player").setCollideWorldBounds(true);
	this.enemy = this.physics.add.sprite(1591.5, 450, "enemy").setCollideWorldBounds(true);
	this.player.setImmovable(true);
	this.enemy.setImmovable(true);

	this.ball = this.physics.add.sprite(800, 450, "ball");
	this.ball.setBounce(1.1);
	this.ball.setCollideWorldBounds(true);
	this.ball.setVelocity(200, 100);

	this.physics.add.collider(this.player, this.ball, this.hit_paddle, undefined, this);
	this.physics.add.collider(this.enemy, this.ball, this.hit_paddle, undefined, this);

	this.score1_text = this.add.text(400, 250, '0', { font: "128px Press Start 2P" });
	this.score2_text = this.add.text(1200, 250, '0', { font: "128px Press Start 2P" });
  }

  update()
  {
	const cursors = this.input.keyboard.createCursorKeys();
    if (cursors.up.isDown)
		this.player.setVelocityY(-400);
	else if (cursors.down.isDown)
		this.player.setVelocityY(400);
	else
		this.player.setVelocityY(0);
	if (this.ball.body.blocked.right && !this.on_paddle)
		this.score1_text.text = String(++this.score1);
	else if (this.ball.body.blocked.left && !this.on_paddle)
		this.score2_text.text = String(++this.score2);
	this.on_paddle = false;
  }

  hit_paddle() // not the best solution to check if it hits the world borders
  {
	this.on_paddle= true;
  }

}