const canvas = document.createElement('canvas');
canvas.id = 'collision';
canvas.width = 1000;
canvas.height = 500;

export default class Map {
    constructor(MapImage, CollisionMap, mapWidth, mapHeight, widthGrids, heightGrids) {
      this.MapImage = MapImage;
      this.CollisionMap = CollisionMap;
      this.mapWidth = mapWidth;
      this.mapHeight = mapHeight;
      this.widthGrids = widthGrids;
      this.heightGrids = heightGrids;
      canvas.getContext('2d').drawImage(this.MapImage, 0,0, this.getGridLength() * 30, this.getGridLength() * 20, 0,0,1000,500);   //Maybe change the 1000/500
    }
    
    draw(ctx, context){
      if (this.MapImage === undefined) {
        return;
      }
      ctx.drawImage(this.MapImage, context.x, context.y, this.getGridLength() * 20, this.getGridLength() * 10, 0, 0, 1000, 500);
    }

    getGridLength(){
      return this.mapWidth / this.widthGrids;
    }

    checkCollision(playerX, playerY){
      let pixelChecker = canvas.getContext('2d').getImageData((playerX-1) * (1000 / 30) + 1000/60 - 5, (playerY-1) * (500/20)  + 500/40-5, 1, 1).data;
      if (pixelChecker[3] === 255 && pixelChecker[0] === 0 && pixelChecker[1] === 0 && pixelChecker[2] === 0) {
        return true;
      }
      return false;
      //FOR TESTING----------------------------------------------------------------------------------------
      //TO PASS IN CANVAS
      //ctx.fillStyle = 'red';
      //ctx.fillRect((playerX-1) * (1000 / 30) + 1000/60 - 5, (playerY-1) * (500/20)  + 500/40-5, 10, 10);
      //FOR TESTING----------------------------------------------------------------------------------------
    }
}
  