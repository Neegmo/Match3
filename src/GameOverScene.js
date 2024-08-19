import Phaser, { FacebookInstantGamesLeaderboard } from "phaser";
import Item from "./classes/Item";
import Field from "./classes/Field";

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super("game-over-scene");
  }

  preload() {
    this.loadFont("troika", "Fonts/troika.otf");
  }

  create(data) {
    this.score = data.score;
    this.add
      .text(
        540,
        600,
        `Game Over\nYour Score:\n ${this.score}\nTap to restart`,
        {
          fontSize: "120px",
          fontFamily: "troika",
          align: "center",
          color: "#808080",
        }
      )
      .setOrigin(0.5, 0.5);

    this.input.once("pointerdown", () => {
      this.scene.start("first-scene");
    });
  }

  loadFont(name, url) {
    var newFont = new FontFace(name, `url(${url})`);
    newFont
      .load()
      .then(function (loaded) {
        document.fonts.add(loaded);
      })
      .catch(function (error) {
        return error;
      });
  }
}
