export default class Player {
  constructor(name, playerSprite) {
    this.name = name;
    this.playerSprite = playerSprite;

    this.x = 0;
    this.y = 0;
    this.newX = 0;
    this.newY = 0;
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
    this.prevX = this.x;
    this.x = newX;
  }

  updateY(newY) {
    this.prevY = this.y;
    this.y = newY;
  }

  drawAt(ctx, x, y, width, height) {
    let sprite = this.playerSprite.getSpriteByDirection(Player.DirectionToIntMap[this.direction]).getSpriteAtFrame(this.currentFrame);
    let marginX = (width - sprite.width) / 2;
    let marginY = (height - sprite.height) / 2;
    ctx.drawImage(sprite.spritesheet, sprite.x, sprite.y, sprite.width, sprite.height, x + marginX, y + marginY, sprite.width, sprite.height);
  }

  animate() {
    //if (!this.isAnimating) return;
    //console.log("sdf");

    /*
    if (this.direction === Player.Direction.UP || this.direction === Player.Direction.DOWN) {
      this.currentFrame++;
      //this.y += this.moveY;
      this.updateY(this.y + this.moveY);
    }
    else if (this.direction === Player.Direction.LEFT || this.direction === Player.Direction.RIGHT) {
      this.currentFrame++;
      //this.x += this.moveX;
      this.updateX(this.x + this.moveX);
    }
    */

    
    if (this.newX === 50){
      this.isAnimating = true;
      if(this.currentFrame < 6){
        this.x += this.newX/6;
        this.currentFrame = this.currentFrame + 1;
      }
      if(this.currentFrame === 6)
        this.newX = 0 ;
      this.isAnimating = false;
    }    
    //console.log(this.currentFrame);
    

    /*
    if (this.currentFrame >= 6) {
      this.isAnimating = false;
    }*/

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