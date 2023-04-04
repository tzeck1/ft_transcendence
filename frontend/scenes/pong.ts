import Phaser from 'phaser';

export default class Pong extends Phaser.Scene
{
  constructor()
  {
    super("pong");
  }

  preload()
  {
    this.load.image("back", "./assets/back.png");
  }

  create()
  {
	this.add.image(800, 450, "back");
  }

  update()
  {
    
  }
}