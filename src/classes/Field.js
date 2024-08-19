import Phaser from "phaser";

export default class Field extends Phaser.GameObjects.Image {
  constructor(scene, col, row) {
    super(scene, col, row, "item");
    this.scene = scene;
    this.col = col;
    this.row = row;
    this.isMatched = false;
    this.item = undefined;
    this.finalFallingTarget = 0;

    this.setTint(0x000000);

    this.posX = 120 + row * 140;
    this.posY = 180 + col * 140;

    this.setAlpha(0.1);

    // this.setDepth(2);

    this.setPosition(this.posX, this.posY);

    scene.add.existing(this);

    this.setInteractive();

    this.on("pointerdown", this.handleClick, this);
    // this.on("pointerup", this.handlePointerUp, this);
  }

  handleClick() {
    if (this.scene.state === 0) {
      this.scene.pickSound.play();
      this.item.setScale(1.1);
      this.scene.selectedCol = this.col;
      this.scene.selectedRow = this.row;
      this.scene.selectedX = this.x;
      this.scene.selectedY = this.y;
      this.scene.startX = this.scene.input.x;
      this.scene.startY = this.scene.input.y;
      this.scene.state = 1;
    }
  }

  // handlePointerUp() {
  //   this.scene.nextCol = this.col;
  //   this.scene.nextRow = this.row;
  //   this.scene.swapItems();
  // }

  checkCurrentItemHeld() {
    let hasAnItem = false;
    this.scene.items.forEach((element) => {
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        element.x,
        element.y
      );
      if (distance < this.width / 2) {
        this.item = element;
        hasAnItem = true;
      }
    });
    if (!hasAnItem) {
      this.item = undefined;
    }
  }
}
