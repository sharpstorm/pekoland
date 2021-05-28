export default class Player {
  constructor(name, playerSprite) {
    this.name = name;
    this.playerSprite = playerSprite;

    this.x = 0;
    this.y = 0;
    this.moveX = 0;
    this.moveY = 0;
    this.direction = Player.Direction.DOWN;
    this.isAnimating = false;
    this.currentFrame = 6;
    this.speechBubble = false;
    this.speechBubbleCounter = 0;
    this.currentSpeech = '';
  }

  updateX(newX) {
    this.x = newX;
  }

  updateY(newY) {
    this.Y = newY;
  }

  drawAt(ctx, x, y, width, height) {
    let sprite = this.playerSprite.getSpriteByDirection(Player.DirectionToIntMap[this.direction]).getSpriteAtFrame(this.currentFrame);
    let marginX = (width - sprite.width) / 2;
    let marginY = (height - sprite.height) / 2;
    ctx.drawImage(sprite.spritesheet, sprite.x, sprite.y, sprite.width, sprite.height, x + marginX, y + marginY, sprite.width, sprite.height);
  }

  animate() {
    //var ctx = document.getElementById('game').getContext('2d');
    //console.log("X:" + this.x + "Y:" + this.y);
    //console.log(ctx.getImageData(this.x+25, this.y+25, 1, 1).data);
    if (!this.isAnimating) return;

    if (this.direction === Player.Direction.UP || this.direction === Player.Direction.DOWN) {
      this.currentFrame++;
      this.y += this.moveY;
    }
    else if (this.direction === Player.Direction.LEFT || this.direction === Player.Direction.RIGHT) {
      this.currentFrame++;
      this.x += this.moveX;
    }

    if (this.currentFrame >= 6) {
      this.isAnimating = false;
    }
    //Collision

    //console.log(ctx.getImageData(this.x, this.y, 1, 1).data[3]);
    //if (ctx.getImageData(this.x, this.y, 50, 50).data[3] == 255) {
      //console.log("collide: " + this.name);
      //console.log(this.x + "," + this.y);
      //console.log(ctx.getImageData(this.x + 25, this.y + 25, 1, 1).data);
    //}
    //console.log(ctx.getImageData(this.x, this.y, 1, 1).data);
    //console.log(this.currentSprite);
  }
}

Player.Direction = {
  UP: 'up',
  RIGHT: 'right',
  DOWN: 'down',
  LEFT: 'left'
}

Player.DirectionToIntMap = {
  'up': 0,
  'right': 1,
  'down': 2,
  'left': 3
}