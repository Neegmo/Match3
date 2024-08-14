import Phaser from "phaser";

// const colors = [0xfb7b77, 0xfdc170, 0xf3f87f, 0x98f786, 0x937df8, 0xf78ef0];
// const colors = [0xffbe0b, 0xfb5607, 0xff006e, 0x8338ec, 0x3a86ff];
// const colors = [0xff595e, 0xffca3a, 0x8ac926, 0x1982c4, 0x6a4c93];
const colors = [0xffec5d, 0xfc42b5, 0x11dffa, 0xff930f, 0xa5eb64];
export default class Item extends Phaser.GameObjects.Image {
  static size = 127; // Move item size here

  constructor(scene, col, row) {
    super(scene, col, row, "item");
    this.scene = scene;
    this.col = col;
    this.row = row;
    this.isMatched = false;

    // Set a random color from the colors array
    this.color = Phaser.Utils.Array.GetRandom(colors);

    this.setTint(this.color);

    this.setDepth(2);

    this.posX = 120 + row * 140;
    this.posY = 560 + col * 140;

    this.setPosition(this.posX, this.posY);

    scene.add.existing(this);
  }

  moveItem(targetX, targetY, duration, callback = () => {}) {
    if (targetX === 0) targetX = this.x;
    if (targetY === 0) targetY = this.y;

    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      ease: "Sine.easeIn",
      duration: duration,
      onComplete: () => {
        this.scene.checkHeldItems();
        callback();
      },
    });
  }
}
