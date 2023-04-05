import Phaser, { Game } from 'phaser';

export default class Pong extends Phaser.Scene
{
	private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
	private enemy!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
	private ball!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

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

	this.physics.add.collider(this.player, this.ball);
	this.physics.add.collider(this.enemy, this.ball);
  }

  update()
  {
	const cursors = this.input.keyboard.createCursorKeys();
    if (cursors.up.isDown == true)
		this.player.setVelocityY(-400);
	else if (cursors.down.isDown)
		this.player.setVelocityY(400);
	else
		this.player.setVelocityY(0);
  }

}