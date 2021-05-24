export default class Player {
  constructor(name, playerSprite) {
    this.name = name;
    this.playerSprite = playerSprite;

    this.x = 0;
    this.y = 0;
    this.moveX = 0;
    this.moveY = 0;
    this.sourceX = 0;
    this.sourceY = 0;
    this.action = '';
    this.isAnimating = false;
    this.currentSprite = 6;
  }

  updateX(newX) {
    this.x = newX;
  }

  updateY(newY) {
    this.Y = newY;
  }

  animate() {
    //var ctx = document.getElementById('game').getContext('2d');
    //console.log("X:" + this.x + "Y:" + this.y);
    //console.log(ctx.getImageData(this.x+25, this.y+25, 1, 1).data);
    if (!this.isAnimating) return;

    if (this.action === 'down') {
      this.sourceX += this.playerSprite.down[2];
      this.currentSprite++;
      this.y += this.moveY;
    }
    else if (this.action === 'up') {
      this.sourceX += this.playerSprite.up[2];
      this.currentSprite++;
      this.y += this.moveY;
    }
    else if (this.action === 'left') {
      this.sourceX += this.playerSprite.left[2];
      this.currentSprite++;
      this.x += this.moveX;
    }
    else if (this.action === 'right') {
      this.sourceX += this.playerSprite.right[2];
      this.currentSprite++;
      this.x += this.moveX;
    }

    if (this.currentSprite >= 6) {
      this.isAnimating = false;
      this.action = '';
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