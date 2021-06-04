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
    
    draw(ctx, camContext) {
      if (this.MapImage === undefined) {
        return;
      }
      let drawOffsetX = 0;
      let drawOffsetY = 0;

      if (camContext.x < 0) {
        drawOffsetX -= camContext.x;
      }
      if (camContext.y < 0) {
        drawOffsetY -= camContext.y;
      }

      let scale = this.getUnitLength() / 50;
      ctx.drawImage(this.MapImage, scale * (camContext.x + drawOffsetX), scale * (camContext.y + drawOffsetY), scale * camContext.viewportWidth, scale * camContext.viewportHeight, 
        drawOffsetX, drawOffsetY, camContext.viewportWidth, camContext.viewportHeight);
    }

    getUnitLength() {
      return this.mapWidth / this.widthGrids;
    }

    checkCollision(playerX, playerY) {
      return false;
      
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
  