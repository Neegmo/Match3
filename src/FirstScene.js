import Phaser from "phaser";
import Item from "./classes/Item";
import Field from "./classes/Field";

export default class FirstScene extends Phaser.Scene {
  constructor() {
    super("first-scene");

    this.state = 0;
    this.selectedCol = null;
    this.selectedRow = null;
    this.nextCol = null;
    this.nextRow = null;

    this.items = [];
    this.fields = [];
  }

  preload() {
    this.load.image("board", "Board.png");
    this.load.image("item", "Item.png");
  }

  create() {
    this.board = this.add
      .image(540, 980, "board")
      //
      .setTint(0x808080);
    //   .setTint(0x69ebfc);

    this.createFields();
    this.createItems();
    this.destroyMatchedItems();
  }

  createFields() {
    for (let row = 0; row < 7; row++) {
      const rowFields = [];
      for (let col = 0; col < 7; col++) {
        const field = new Field(this, col, row);
        rowFields.push(field);
      }
      this.fields.push(rowFields);
    }
  }

  createItems() {
    for (let row = 0; row < 7; row++) {
      //   const rowItems = [];
      for (let col = 0; col < 7; col++) {
        const item = new Item(this, col, row);
        this.items.push(item);
        this.fields[row][col].item = item;
      }
    }
  }

  swapItems() {
    let colDifference = Math.abs(this.selectedCol - this.nextCol);
    let rowDifference = Math.abs(this.selectedRow - this.nextRow);

    if (colDifference === 1 && rowDifference === 0) {
      this.fields[this.selectedRow][this.selectedCol].item.setScale(1);
      this.state = 0;

      this.fields[this.selectedRow][this.selectedCol].item.moveItem(
        0,
        this.fields[this.nextRow][this.nextCol].y,
        150
      );

      this.fields[this.nextRow][this.nextCol].item.moveItem(
        0,
        this.fields[this.selectedRow][this.selectedCol].y,
        150
      );

      this.time.delayedCall(250, () => {
        this.checkHeldItems();
        this.destroyMatchedItems();
      });
    }

    if (colDifference === 0 && rowDifference === 1) {
      this.fields[this.selectedRow][this.selectedCol].item.setScale(1);
      this.state = 0;

      this.fields[this.selectedRow][this.selectedCol].item.moveItem(
        this.fields[this.nextRow][this.nextCol].x,
        0,
        150
      );

      this.fields[this.nextRow][this.nextCol].item.moveItem(
        this.fields[this.selectedRow][this.selectedCol].x,
        0,
        150
      );

      this.time.delayedCall(250, () => {
        this.checkHeldItems();
        this.destroyMatchedItems();
      });
    }
  }

  checkRowMatches() {
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (!this.fields[row][col].item) continue;
        let nextIndex = col + 1;
        let currentMatchedItems = [this.fields[row][col].item];

        while (
          nextIndex < 7 &&
          this.fields[row][nextIndex].item &&
          this.fields[row][col].item.color ===
            this.fields[row][nextIndex].item.color
        ) {
          currentMatchedItems.push(this.fields[row][nextIndex].item);
          nextIndex++;
        }

        if (currentMatchedItems.length >= 3) {
          currentMatchedItems.forEach((element) => {
            element.isMatched = true;
          });
        }
      }
    }
  }

  checkColMatches() {
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row < 5; row++) {
        if (!this.fields[row][col].item) continue;
        let nextIndex = row + 1;
        let currentMatchedfields = [this.fields[row][col].item];
        while (
          nextIndex < 7 &&
          this.fields[nextIndex][col].item &&
          this.fields[row][col].item.color ===
            this.fields[nextIndex][col].item.color
        ) {
          currentMatchedfields.push(this.fields[nextIndex][col].item);
          nextIndex++;
        }
        if (currentMatchedfields.length >= 3) {
          currentMatchedfields.forEach((element) => {
            element.isMatched = true;
          });
        }
      }
    }
  }

  destroyMatchedItems() {
    this.checkColMatches();
    this.checkRowMatches();
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (this.fields[row][col].item === undefined) continue;
        if (this.fields[row][col].item.isMatched) {
          let index = this.items.indexOf(this.fields[row][col].item);
          this.items.splice(index, 1);
          this.fields[row][col].item.destroy();
          this.fields[row][col].item = undefined;
        }
      }
    }

    this.checkForFallingItems();
  }

  checkForFallingItems() {
    let maxFallintTarget = 0;
    for (let row = 0; row < 7; row++) {
      for (let col = 6; col > -1; col--) {
        if (this.fields[row][col].item) continue;
        for (let coldif = col - 1; coldif > -1; coldif--) {
          if (this.fields[row][coldif].item) {
            this.fields[row][coldif].finalFallingTarget++;
            if (maxFallintTarget < this.fields[row][coldif].finalFallingTarget)
              maxFallintTarget = this.fields[row][coldif].finalFallingTarget;
          }
        }
      }
      for (let col = 6; col > -1; col--) {
        if (this.fields[row][col].item) {
          let finalFallingTarget = this.fields[row][col].finalFallingTarget;
          if (this.fields[row][col + finalFallingTarget] === undefined)
            continue;
          this.fields[row][col].item.moveItem(
            0,
            this.fields[row][col + finalFallingTarget].y,
            150 * finalFallingTarget
          );
        }
      }
    }

    this.time.delayedCall(maxFallintTarget * 150 + 100, () => {
      this.populateEmptyFields();
    });
    // this.time.delayedCall(maxFallintTarget * 150 + 200, () => {
    //   this.destroyMatchedItems();
    // });
  }

  checkHeldItems() {
    this.fields.forEach((element) => {
      element.forEach((element) => {
        element.finalFallingTarget = 0;
        element.checkCurrentItemHeld();
      });
    });
  }

  populateEmptyFields() {
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (!this.fields[row][col].item) {
          const item = new Item(this, col, row);
          this.items.push(item);
          this.fields[row][col].item = item;
        }
      }
    }
    this.checkHeldItems();
    // this.destroyMatchedItems();
  }
}
