import Phaser from 'phaser';

import Pong from "../scenes/pong";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1088,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    width: 1920,
    height: 1088
  },
  scene: [Pong]
};

export default new Phaser.Game(config);