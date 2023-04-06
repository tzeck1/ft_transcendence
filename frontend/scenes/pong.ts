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
	private hight = 1088;

  constructor()
  {
    super("pong");
  }

  preload()
  {
    this.load.image("back", "./assets/field.png");
    this.load.image("player", "./assets/paddle.png");
    this.load.image("enemy", "./assets/paddle.png");
    this.load.image("ball", "./assets/ball.png");
  }

  create()
  {
	this.add.image(this.width / 2, this.hight / 2, "back");

	this.player = this.physics.add.sprite(this.width * 0.04, this.hight / 2, "player").setCollideWorldBounds(true);
	this.enemy = this.physics.add.sprite(this.width * 0.96, this.hight / 2, "enemy").setCollideWorldBounds(true);
	this.player.setImmovable(true);
	this.enemy.setImmovable(true);

	this.ball = this.physics.add.sprite(this.width / 2, this.hight / 2, "ball");
	this.ball.setBounce(1.1);
	this.ball.setCollideWorldBounds(true);
	this.ball.setVelocity(200, 100);

	this.physics.add.collider(this.player, this.ball, this.hit_paddle, undefined, this);
	this.physics.add.collider(this.enemy, this.ball, this.hit_paddle, undefined, this);

	this.score1_text = this.add.text(this.width / 3, this.hight / 4, '0', { fontFamily: "ibm-3270", fontSize: "128px" });
	this.score2_text = this.add.text(2 * this.width / 3 - 64, this.hight / 4, '0', { fontFamily: "ibm-3270", fontSize: "128px" });
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