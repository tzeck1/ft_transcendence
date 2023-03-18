import Phaser from 'phaser';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
    },
  },
  scene: {
    preload: preload,
    create: create,
  },
};

const game = new Phaser.Game(config);

function preload(this: Phaser.Scene) {
  this.load.setBaseURL('https://labs.phaser.io');
  this.load.image('sky', 'assets/skies/space3.png');
}

function create(this: Phaser.Scene) {
  this.add.image(400, 300, 'sky');
}
