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
    return {x : this.x / this.map.getGridLength(), y: this.y / this.map.getGridLength()};
  }

  animate(){
    if (Math.abs(this.newX - this.x) > 0.00001) {
      this.x += (this.newX - this.oldX) / 24;
      return;
    } else if (Math.abs(this.newY - this.y) > 0.00001) {
      this.y += (this.newY - this.oldY) / 24;
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

