import Phaser from 'phaser';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
    },
  },
};

const game = new Phaser.Game(config);

let ball: Phaser.Physics.Arcade.Image;
let leftPaddle: Phaser.Physics.Arcade.Image;
let rightPaddle: Phaser.Physics.Arcade.Image;
const paddleVelocity = 200;

function preload(this: Phaser.Scene) {
  this.load.setBaseURL('./assets');
  this.load.image('ball', 'ball.png');
  this.load.image('paddle', 'paddle.png');
}

function create(this: Phaser.Scene) {
  ball = this.physics.add.image(400, 300, 'ball');
  leftPaddle = this.physics.add.image(30, 300, 'paddle');
  rightPaddle = this.physics.add.image(770, 300, 'paddle');

  ball.setCollideWorldBounds(true);
  leftPaddle.setCollideWorldBounds(true);
  rightPaddle.setCollideWorldBounds(true);

  ball.setBounce(1, 1);
  ball.setVelocity(200, 100);

  this.physics.add.collider(ball, leftPaddle, (ball, paddle) => paddleHit(ball as Phaser.Physics.Arcade.Image, paddle as Phaser.Physics.Arcade.Image), undefined, this);
  this.physics.add.collider(ball, rightPaddle, (ball, paddle) => paddleHit(ball as Phaser.Physics.Arcade.Image, paddle as Phaser.Physics.Arcade.Image), undefined, this);
}

function update(this: Phaser.Scene) {
  const cursors = this.input.keyboard.createCursorKeys();
  const leftPaddleUp = this.input.keyboard.addKey('W');
  const leftPaddleDown = this.input.keyboard.addKey('S');
  const rightPaddleUp = cursors.up;
  const rightPaddleDown = cursors.down;

  if (leftPaddleUp.isDown) {
    leftPaddle.setVelocityY(-paddleVelocity);
  } else if (leftPaddleDown.isDown) {
    leftPaddle.setVelocityY(paddleVelocity);
  } else {
    leftPaddle.setVelocityY(0);
  }

  if (rightPaddleUp.isDown) {
    rightPaddle.setVelocityY(-paddleVelocity);
  } else if (rightPaddleDown.isDown) {
    rightPaddle.setVelocityY(paddleVelocity);
  } else {
    rightPaddle.setVelocityY(0);
  }
}

function paddleHit(ball: Phaser.Physics.Arcade.Image, paddle: Phaser.Physics.Arcade.Image): void {
  if (ball.x < 400) {
    ball.setVelocityX(200);
  } else {
    ball.setVelocityX(-200);
  }
}