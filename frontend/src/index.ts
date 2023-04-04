import Phaser from 'phaser';

import Pong from "../scenes/pong";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1600,
  height: 900,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: [Pong]
};

export default new Phaser.Game(config);