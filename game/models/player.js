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
    this.speechBubble = false;
    this.speechBubbleCounter = 0;
    this.currentSpeech = '';
  }

  updateX(X) {
    this.oldX = this.x;
    this.newX = X;
  }

  updateY(Y) {
    this.oldY = this.y;
    this.newY = Y;
  }

  updateMessage(m){
      this.currentSpeech = m;
      this.speechBubbleCounter = 0;
      this.speechBubble = true;
  }

  drawAt(ctx, x, y, width, height) {
    let sprite = this.playerSprite.getSpriteByDirection(Player.DirectionToIntMap[this.direction]).getSpriteAtFrame(this.currentFrame);
    let marginX = (width - sprite.width) / 2;
    let marginY = (height - sprite.height) / 2;
    ctx.drawImage(sprite.spritesheet, sprite.x, sprite.y, sprite.width, sprite.height, x + marginX, y + marginY, sprite.width, sprite.height);
  }


  moveTo(newX, newY){
    if (this.newX > this.oldX){
      
      if(this.currentFrame < 6){
        this.x += (this.newX - this.oldX)/6;
        this.currentFrame = this.currentFrame + 1;
      }
      if(this.currentFrame >= 6){
        this.x = Math.round(this.x);
        this.newX = this.x;
        this.oldX = this.x;
        this.isAnimating = false;
      }
    }

    else if (this.newX < this.oldX){
      if(this.currentFrame < 6){
        this.x += (this.newX - this.oldX)/6;
        this.currentFrame = this.currentFrame + 1;
      }
      if(this.currentFrame >= 6){
        this.x = Math.round(this.x);
        this.newX = this.x;
        this.oldX = this.x;
        this.isAnimating = false;
      }
    }

    else if (this.newY < this.oldY){
      if(this.currentFrame < 6){
        this.y += (this.newY - this.oldY)/6;
        this.currentFrame = this.currentFrame + 1;
      }
      if(this.currentFrame >= 6){
        this.y = Math.round(this.y);
        this.newY = 0;
        this.oldY = this.y;
        this.isAnimating = false;
      }
    }

    else if (this.newY > this.oldY){
      if(this.currentFrame < 6){
        this.y += (this.newY - this.oldY)/6;
        this.currentFrame = this.currentFrame + 1;
      }
      if(this.currentFrame >= 6){
        this.y = Math.round(this.y);
        this.newY = 0;
        this.oldY = this.y;
        this.isAnimating = false;
      }
    }
  }
  animate() {
    if (this.newX > this.oldX){
      
      if(this.currentFrame < 6){
        this.x += (this.newX - this.oldX)/6;
        this.currentFrame = this.currentFrame + 1;
      }
      if(this.currentFrame >= 6){
        this.x = Math.round(this.x);
        this.newX = this.x;
        this.oldX = this.x;
        this.isAnimating = false;
      }
    }

    else if (this.newX < this.oldX){
      if(this.currentFrame < 6){
        this.x += (this.newX - this.oldX)/6;
        this.currentFrame = this.currentFrame + 1;
      }
      if(this.currentFrame >= 6){
        this.x = Math.round(this.x);
        this.newX = this.x;
        this.oldX = this.x;
        this.isAnimating = false;
      }
    }

    else if (this.newY < this.oldY){
      if(this.currentFrame < 6){
        this.y += (this.newY - this.oldY)/6;
        this.currentFrame = this.currentFrame + 1;
      }
      if(this.currentFrame >= 6){
        this.y = Math.round(this.y);
        this.newY = 0;
        this.oldY = this.y;
        this.isAnimating = false;
      }
    }

    else if (this.newY > this.oldY){
      if(this.currentFrame < 6){
        this.y += (this.newY - this.oldY)/6;
        this.currentFrame = this.currentFrame + 1;
      }
      if(this.currentFrame >= 6){
        this.y = Math.round(this.y);
        this.newY = 0;
        this.oldY = this.y;
        this.isAnimating = false;
      }
    }

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