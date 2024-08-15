import Phaser, { FacebookInstantGamesLeaderboard } from "phaser";
import Item from "./classes/Item";
import Field from "./classes/Field";

export default class FirstScene extends Phaser.Scene {
  constructor() {
    super("first-scene");
  }

  preload() {
    this.loadFont("troika", "Fonts/troika.otf");

    this.load.image("board", "Board.png");
    this.load.image("item", "Item.png");
    this.load.image("timeBar", "TimeBar.png");

    this.load.audio("newBubbles", ["sounds/icon_drop_1.mp3"]);
    this.load.audio("burst1", ["sounds/match_1.mp3"]);
    this.load.audio("burst2", ["sounds/match_2.mp3"]);
    this.load.audio("burst3", ["sounds/match_3.mp3"]);
    this.load.audio("burst4", ["sounds/match_4.mp3"]);
    this.load.audio("burst5", ["sounds/match_5.mp3"]);
    this.load.audio("pick", ["sounds/ui_accept.mp3"]);
    this.load.audio("swipe", ["sounds/ui_slide_in.mp3"]);
  }

  create() {
    this.initiateVariables();

    this.board = this.add
      .image(540, 980, "board")
      //
      .setTint(0x808080);
    //   .setTint(0x69ebfc);

    this.createGameTimer();

    this.createFields();
    this.createItems();

    this.createSounds();

    this.input.once("pointerdown", () => {
      this.state = 0;
      this.gameStarted = true;
      console.log("Game Started!");
      this.destroyMatchedItems();
    });

    this.input.on("pointerdown", this.handlePointerDown, this);

    this.input.on("pointerup", this.handlePointerUp, this);
  }

  update(time, delta) {
    if (!this.gameStarted || true) return;
    console.log(delta);

    this.timerDecrementFactor += delta / 40000;

    this.gameOverTimer -= (delta / 200) * this.timerDecrementFactor;
    this.timeBar.setScale(this.gameOverTimer / 100, 1);

    if (this.gameOverTimer <= 0) {
      this.scene.start("first-scene");
    }

    this.scoreText.text = `${this.scoreValue}`;
  }

  initiateVariables() {
    this.state = 1;
    this.selectedCol = null;
    this.selectedRow = null;
    this.selectedX = null;
    this.selectedY = null;
    this.startX = null;
    this.startY = null;

    this.nextCol = null;
    this.nextRow = null;

    this.items = [];
    this.fields = [];

    this.burstSoundIndex = 0;

    this.burstSoundSequence = [
      "burst1",
      "burst2",
      "burst3",
      "burst4",
      "burst5",
    ];

    this.gameStarted = false;
    this.gameOverTimer = 100;
    this.timerDecrementFactor = 1;

    this.scoreValue = 0;
    this.scoreText = this.add
      .text(540, 400, `${this.scoreValue}`, {
        fontSize: "120px",
        fontFamily: "troika",
        align: "center",
        color: "#808080",
      })
      .setOrigin(0.5, 0.5);
  }

  handlePointerDown() {
    // if (this.state !== 0) return;
    // this.startX = this.input.x;
    // this.startY = this.input.y;
  }

  handlePointerUp() {
    if (this.state !== 1) return;
    this.swapItems();
  }

  createGameTimer() {
    this.timeBar = this.add.image(540, 1550, "timeBar").setTint(0x808080);
  }

  createSounds() {
    if (!this.newBubblesSound || !this.newBubblesSound.isPlaying) {
      this.newBubblesSound = this.sound.add("newBubbles", {
        loop: false,
        volume: 0.4,
      });
    }
    if (!this.burstSound || !this.burstSound.isPlaying) {
      this.burstSound = this.sound.add("burst1", { loop: false, volume: 0.4 });
    }
    if (!this.pickSound || !this.pickSound.isPlaying) {
      this.pickSound = this.sound.add("pick", { loop: false, volume: 0.4 });
    }
    if (!this.swipeSound || !this.swipeSound.isPlaying) {
      this.swipeSound = this.sound.add("swipe", { loop: false, volume: 0.4 });
    }
  }

  playBurstSequential() {
    this.burstSound.play();
    console.log("Test");
    this.burstSound.on("complete", () => {
      this.burstSound.destroy();
      if (this.burstSoundIndex < 4) this.burstSoundIndex++;
      this.burstSound = this.sound.add(
        this.burstSoundSequence[this.burstSoundIndex],
        { loop: false, volume: 0.4 }
      );
    });
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

  findNextField() {
    const currentX = this.input.x;
    const currentY = this.input.y;

    const xDifference = this.startX - currentX;
    const yDifference = this.startY - currentY;

    if (
      Math.abs(this.selectedX - currentX) < 70 &&
      Math.abs(this.selectedY - currentY) < 70
    )
      return;

    if (Math.abs(xDifference) > Math.abs(yDifference)) {
      if (xDifference < 0 && this.selectedRow < 6) {
        this.nextRow = this.selectedRow + 1;
        this.nextCol = this.selectedCol;
      } else if (xDifference > 0 && this.selectedRow > 0) {
        this.nextRow = this.selectedRow - 1;
        this.nextCol = this.selectedCol;
      }
    } else {
      if (yDifference < 0 && this.selectedCol < 6) {
        this.nextRow = this.selectedRow;
        this.nextCol = this.selectedCol + 1;
      } else if (yDifference > 0 && this.selectedCol > 0) {
        this.nextRow = this.selectedRow;
        this.nextCol = this.selectedCol - 1;
      }
    }
  }

  swapItems() {
    this.findNextField();
    console.log(
      this.nextRow +
        " " +
        this.selectedRow +
        " " +
        this.nextCol +
        " " +
        this.selectedCol
    );
    if (
      this.selectedCol !== null &&
      this.nextCol !== null &&
      this.selectedRow !== null &&
      this.nextRow !== null
    ) {
      let colDifference = Math.abs(this.selectedCol - this.nextCol);
      let rowDifference = Math.abs(this.selectedRow - this.nextRow);
      console.log("Row dif: " + rowDifference);
      console.log("Col dif: " + colDifference);

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

        this.swipeSound.play();
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

        this.swipeSound.play();
      }
    }

    // this.resetFieldInfo();
  }

  resetFieldInfo() {
    this.selectedCol = null;
    this.selectedRow = null;
    this.selectedX = null;
    this.selectedY = null;
    this.startX = null;
    this.startY = null;

    this.nextCol = null;
    this.nextRow = null;
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
    let matchedItems = false;
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (this.fields[row][col].item === undefined) continue;
        if (this.fields[row][col].item.isMatched) {
          matchedItems = true;
          this.scoreValue++;
          this.fields[row][col].item.scaleItem(
            1.3,
            1.3,
            "Cubic.easeIn",
            150,
            0,
            false,
            () => {
              let index = this.items.indexOf(this.fields[row][col].item);
              this.items.splice(index, 1);
              this.fields[row][col].item.destroy();
              this.fields[row][col].item = undefined;
            }
          );
        }
      }
    }

    if (!matchedItems) return;

    this.time.delayedCall(150, () => {
      this.burstSound.play();
      if (this.gameOverTimer + 25 <= 100) this.gameOverTimer += 15;
      else this.gameOverTimer = 100;
    });

    this.time.delayedCall(250, () => {
      this.checkForFallingItems();
    });
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
          this.newBubblesSound.play();
          const item = new Item(this, col, row);
          item.setScale(0.1);
          item.scaleItem(1, 1, "Back.easeOut", 250, 0, false);
          this.items.push(item);
          this.fields[row][col].item = item;
        }
      }
    }
    this.checkHeldItems();
    // this.destroyMatchedItems();
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
