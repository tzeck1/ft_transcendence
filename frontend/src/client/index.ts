import Phaser from 'phaser';
import * as Colyseus from 'colyseus_client';

import Pong from "./scenes/pong";
import Start from "./scenes/start";
import End from "./scenes/end";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  parent: "game",
  transparent: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
    },
  },
  scale: {
    parent: "game",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1920,
    height: 1080
  },
  scene: [Start, Pong, End]
};

var client = new Colyseus.Client("ws://127.0.0.1:2567");
export default new Phaser.Game(config);