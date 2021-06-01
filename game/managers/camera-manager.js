let instance;

//coordinates as top right

export default class CameraManager {
  constructor() {
    this.map = undefined;
    this.centering = 1;    //TO BE REMOVED

    this.x = 0;
    this.y = 0;
    this.oldX = 0;
    this.oldY = 0;
    this.newX = 0;
    this.newY = 0;
  }

  draw(ctx) {
    if (this.map === undefined) {
      return;
    }
    ctx.drawImage(this.map.MapImage, this.x, this.y, this.map.getGridLength() * 20, this.map.getGridLength() * 10, 0, 0, 1000, 500);
  }

  moveCamera(newX,newY){
    this.oldX = this.x;
    this.oldY = this.y;
    this.newX = newX;
    this.newY = newY;
  }

  moveCameraToGrid(newX,newY){
    this.oldX = this.x;
    this.oldY = this.y;
    this.newX = newX * this.map.getGridLength();
    this.newY = newY * this.map.getGridLength();
  }

  getCameraGridCoord(){
    return {x : this.newX / this.map.getGridLength(), y: this.newY / this.map.getGridLength()};
  }

  animate(delta) {
    if (this.newX - this.x === 0 && this.newY - this.y === 0) return;

    let stdDeltaX = (this.newX - this.oldX) / 24;
    let stdDeltaY = (this.newY - this.oldY) / 24;

    if (Math.abs(this.newX - this.x) > Math.abs(stdDeltaX)) {
      this.x += stdDeltaX * (delta / 16.66667);
      return;
    } else if (Math.abs(this.newY - this.y) > Math.abs(stdDeltaY)) {
      this.y += stdDeltaY * (delta / 16.66667);
      return;
    }

    this.x = this.newX;
    this.y = this.newY;
    this.oldX = this.x;
    this.oldY = this.y;
  }
  

  static getInstance() {
    if (instance === undefined) {
      instance = new CameraManager();
    }
    return instance;
  }
}

