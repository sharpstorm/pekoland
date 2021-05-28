import Chat from "../models/chat.js";

export default class Player {
  constructor(name, playerSprite) {
    this.name = name;
    this.playerSprite = playerSprite;

    this.x = 0;
    this.y = 0;
    this.newX = 0;
    this.newY = 0;
    this.oldX = 0;
    this.oldY = 0;
    this.moveX = 0;
    this.moveY = 0;
    this.direction = Player.Direction.DOWN;
    this.isAnimating = false;
    this.currentFrame = 6;
    this.chat = new Chat(); 
  }

  drawAt(ctx, x, y, width, height) {
    ctx.strokeStyle = 'black';
    ctx.font = '10px Arial';
    ctx.strokeText("   "+ this.name, this.x, this.y);
    let sprite = this.playerSprite.getSpriteByDirection(Player.DirectionToIntMap[this.direction]).getSpriteAtFrame(this.currentFrame);
    let marginX = (width - sprite.width) / 2;
    let marginY = (height - sprite.height) / 2;
    ctx.drawImage(sprite.spritesheet, sprite.x, sprite.y, sprite.width, sprite.height, x + marginX, y + marginY, sprite.width, sprite.height);
    this.chat.drawAt(ctx, this.x + 40, this.y-30);  //Hard Coded
  }

  moveTo(newX, newY) {
    this.oldX = this.x;
    this.oldY = this.y;
    this.newX = newX;
    this.newY = newY;
    this.isAnimating = true;
    this.currentFrame = 0;
  }

  animate() {
    if (!this.isAnimating) return;

    if (this.currentFrame < 6) {
      if (Math.abs(this.newX - this.x) > 0.00001) {
        this.x += (this.newX - this.oldX) / 6;
        this.currentFrame++;
        return;
      } else if (Math.abs(this.newY - this.y) > 0.00001) {
        this.y += (this.newY - this.oldY) / 6;
        this.currentFrame++;
        return;
      }
    }
    this.x = this.newX;
    this.y = this.newY;
    this.oldX = this.x;
    this.oldY = this.y;
    this.isAnimating = false;
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