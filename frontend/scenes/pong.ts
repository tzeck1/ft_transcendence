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

  constructor()
  {
    super("pong");
  }

  preload()
  {
    this.load.image("back", "./assets/back.png");
    this.load.image("player", "./assets/paddle.png");
    this.load.image("enemy", "./assets/paddle.png");
    this.load.image("ball", "./assets/ball.png");
  }

  create()
  {
	this.add.image(this.width / 2, this.height / 2, "back");

	this.player = this.physics.add.sprite(this.width * 0.04, this.height / 2, "player").setCollideWorldBounds(true);
	this.enemy = this.physics.add.sprite(this.width * 0.96, this.height / 2, "enemy").setCollideWorldBounds(true);
	this.player.setImmovable(true);
	this.enemy.setImmovable(true);

	this.ball = this.physics.add.sprite(this.width / 2, this.height / 2, "ball");
	this.ball.setBounce(1.1);
	this.ball.setCollideWorldBounds(true);
	this.ball.setVelocity(this.random_velocity(false), this.random_velocity(true));

	this.physics.add.collider(this.player, this.ball, this.hit_paddle, undefined, this);
	this.physics.add.collider(this.enemy, this.ball, this.hit_paddle, undefined, this);

	this.score1_text = this.add.text(this.width / 3, this.height / 4, '0', { fontFamily: "ibm-3270", fontSize: "128px" });
	this.score2_text = this.add.text(2 * this.width / 3 - 64, this.height / 4, '0', { fontFamily: "ibm-3270", fontSize: "128px" });
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
	if (this.ball.body.onWall() && !this.on_paddle)
		this.scored();
	this.on_paddle = false;
  }

  hit_paddle() // not the best solution to check if it hits the world borders
  {
	this.on_paddle= true;
  }

  scored()
  {
	if (this.ball.body.blocked.right)
		this.score1_text.text = String(++this.score1);
	else
		this.score2_text.text = String(++this.score2);
	this.ball.setVelocity(this.random_velocity(false), this.random_velocity(true));
	this.ball.setPosition(this.width / 2, this.height / 2);
  }

  random_velocity(y)
  {
	if (y == true)
		return Phaser.Math.FloatBetween(-200, 200);
	if (Phaser.Math.Between(0, 1) == 0)
		return 200;
	return -200;
  }
}