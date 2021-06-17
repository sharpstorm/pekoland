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
    const collisionCanvas = document.createElement('canvas');
    collisionCanvas.width = this.CollisionMap.width;
    collisionCanvas.height = this.CollisionMap.height;
    const ctx = collisionCanvas.getContext('2d');
    ctx.drawImage(this.CollisionMap, 0, 0, this.CollisionMap.width, this.CollisionMap.height);

    this.collisionMatrix = [];
    const unit = this.getUnitLength();
    for (let x = 0; x < this.mapWidth; x += unit) {
      const col = [];
      for (let y = 0; y < this.mapHeight; y += unit) {
        const pixel = ctx.getImageData(x + (unit / 2), y + (unit / 2), 1, 1).data;
        if (pixel[3] === 255 && pixel[0] === 0 && pixel[1] === 0 && pixel[2] === 0) {
          col.push(1);
        } else {
          col.push(0);
        }
      }
      this.collisionMatrix.push(col);
    }
  }

  getFuniture(x, y) {
    const colorCanvas = document.createElement('canvas');
    colorCanvas.width = this.mapWidth;
    colorCanvas.height = this.mapHeight;
    const ctx = colorCanvas.getContext('2d');
    if (this.CollisionMap !== undefined) {
      ctx.drawImage(this.CollisionMap, 0, 0, this.mapWidth, this.mapHeight);
      const pixel = (ctx.getImageData(x / 2, y / 2, 1, 1).data);
      if (pixel[3] === 255 && pixel[0] === 255 && pixel[1] === 0 && pixel[2] === 0) {
        return 'BoardGame';
      }
    }
    return undefined;
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

    const scale = this.getUnitLength() / GameConstants.UNIT;
    ctx.drawImage(this.MapImage, scale * (camContext.x + drawOffsetX),
      scale * (camContext.y + drawOffsetY),
      scale * camContext.viewportWidth,
      scale * camContext.viewportHeight,
      drawOffsetX, drawOffsetY, camContext.viewportWidth, camContext.viewportHeight);
  }

  getUnitLength() {
    return this.mapWidth / this.widthGrids;
  }

  checkCollision(playerX, playerY) {
    const x = Math.floor(playerX / GameConstants.UNIT);
    const y = Math.floor(playerY / GameConstants.UNIT);
    return this.collisionMatrix[x][y] === 1;
  }
}
