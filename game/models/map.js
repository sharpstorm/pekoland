import GameConstants from '../game-constants.js';

export default class Map {
    constructor(MapImage, CollisionMap, mapWidth, mapHeight, widthGrids, heightGrids) {
      this.MapImage = MapImage;
      this.CollisionMap = CollisionMap;
      this.mapWidth = mapWidth;
      this.mapHeight = mapHeight;
      this.widthGrids = widthGrids;
      this.heightGrids = heightGrids;

      this.initCollisionMap();
    }

    initCollisionMap() {
      let collisionCanvas = document.createElement('canvas');
      collisionCanvas.width = this.CollisionMap.width;
      collisionCanvas.height = this.CollisionMap.height;
      let ctx = collisionCanvas.getContext('2d');
      ctx.drawImage(this.CollisionMap, 0, 0, this.CollisionMap.width, this.CollisionMap.height);

      this.collisionMatrix = [];
      let unit = this.getUnitLength();
      for (let x = 0; x < this.mapWidth; x += unit) {
        let col = [];
        for (let y = 0; y < this.mapHeight; y += unit) {
          let pixel = ctx.getImageData(x + (unit / 2), y + (unit / 2), 1, 1).data;
          if (pixel[3] === 255 && pixel[0] === 0 && pixel[1] === 0 && pixel[2] === 0) {
            col.push(1);
          } else {
            col.push(0);
          }
        }
        this.collisionMatrix.push(col);
      }
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

      let scale = this.getUnitLength() / GameConstants.UNIT;
      ctx.drawImage(this.MapImage, scale * (camContext.x + drawOffsetX), scale * (camContext.y + drawOffsetY), scale * camContext.viewportWidth, scale * camContext.viewportHeight, 
        drawOffsetX, drawOffsetY, camContext.viewportWidth, camContext.viewportHeight);
    }

    getUnitLength() {
      return this.mapWidth / this.widthGrids;
    }

    checkCollision(playerX, playerY) {
      return this.collisionMatrix[Math.floor(playerX / GameConstants.UNIT)][Math.floor(playerY / GameConstants.UNIT)] === 1;
    }
}
  