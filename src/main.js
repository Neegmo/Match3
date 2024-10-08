import Phaser from "phaser";

import FirstScene from "./FirstScene";
import GameOverScene from "./GameOverScene";

const config = {
  type: Phaser.AUTO,
  parent: "app",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    width: 1080,
    height: 1200,
  },
  scene: [FirstScene, GameOverScene],
  backgroundColor: "#ffffff",
  //   backgroundColor: "#6d9efc",
};

export default new Phaser.Game(config);
