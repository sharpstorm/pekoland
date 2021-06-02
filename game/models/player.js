import PlayerManager from "../managers/player-manager.js";
import Chat from "../models/chat.js";

export default class Player {
  constructor(name, playerSprite) {
    this.name = name;
    this.playerSprite = playerSprite;

    this.x = 450;
    this.y = 250;
    this.newX = 450;
    this.newY = 250;
    this.oldX = 450;
    this.oldY = 250;
    this.moveX = 0;
    this.moveY = 0;
    this.direction = Player.Direction.DOWN;
    this.isAnimating = false;
    this.currentFrame = 6;
    this.chat = new Chat(); 
  }

  drawAt(ctx, x, y, width, height, context) {
    let sprite = this.playerSprite.getSpriteByDirection(Player.DirectionToIntMap[this.direction]).getSpriteAtFrame(this.currentFrame);
    let marginX = (width - sprite.width) / 2;
    let marginY = (height - sprite.height) / 2;
    if(this.name === PlayerManager.getInstance().getSelf().name){
      ctx.drawImage(sprite.spritesheet, sprite.x, sprite.y, sprite.width, sprite.height, 450 + marginX, 250 + marginY, sprite.width, sprite.height);
      this.chat.drawAt(ctx, 450 + 40, 250-30);  //Hard Coded
      ctx.strokeStyle = 'black';
      ctx.font = '10px Arial';
      ctx.strokeText("   "+ this.name, 450, 250);
    }
    else{
      ctx.drawImage(sprite.spritesheet, sprite.x, sprite.y, sprite.width, sprite.height, this.x  - context.getGridCoord().x * 50  + marginX, this.y  - context.getGridCoord().y * 50 + marginY, sprite.width, sprite.height);
      this.chat.drawAt(ctx, this.x + 40, this.y-30);  //Hard Coded
      ctx.strokeStyle = 'black';
      ctx.font = '10px Arial';
      ctx.strokeText("   "+ this.name, this.x  - context.getGridCoord().x * 50, this.y  - context.getGridCoord().y * 50);
    }
  }

  moveTo(newX, newY) {
      this.oldX = this.x;
      this.oldY = this.y;
      this.newX = newX;
      this.newY = newY;
      this.isAnimating = true;
      this.currentFrame = 0;
  }

  moveImmediate(newX,newY){
    this.oldX = newX;
    this.oldY = newY
    this.newX = newX;
    this.newY = newY;
    this.x = newX;
    this.y = newY;
  }

  moveToGrid(x,y){
    this.oldX = (x-1) * 50;
    this.oldY = (y-1) * 50
    this.newX = (x-1) * 50;;
    this.newY = (y-1) * 50;
    this.x = (x-1) * 50;;
    this.y = (y-1) * 50;
  }

  getGridCoord(){
    return {x: this.x / 50 + 1, y: this.y / 50 + 1};   //TO CHECK AGAIN. HARD CODED 50.
  }

  animate(delta, majorUpdate) {
    if (!this.isAnimating) return;
    if (this.currentFrame < 6) {
      if (Math.abs(this.newX - this.x) > 0.00001) {
        this.x += (this.newX - this.oldX) / 24 * (delta / 16.66667);
      } else if (Math.abs(this.newY - this.y) > 0.00001) {
        this.y += (this.newY - this.oldY) / 24 * (delta / 16.66667);
      }
      if (majorUpdate) {
        this.currentFrame++;
      }
      return;
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