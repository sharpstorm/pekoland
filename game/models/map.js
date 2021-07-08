import GameConstants from '../game-constants.js';

export default class Map {
  constructor(mapImage, CollisionMap, mapWidth, mapHeight, widthGrids, heightGrids) {
    this.mapImage = mapImage;
    this.CollisionMap = CollisionMap;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.widthGrids = widthGrids;
    this.heightGrids = heightGrids;

    // Furniture State
    this.furnitureFactory = undefined;
    this.furnitureList = [];

    // Grid Overlay
    this.gridCache = undefined;
    // Composite Image
    this.mapCache = undefined;

    this.initCollisionMap();
    this.initComposite();
  }

  initCollisionMap() {
    const collisionCanvas = document.createElement('canvas');
    collisionCanvas.width = this.CollisionMap.width;
    collisionCanvas.height = this.CollisionMap.height;
    const ctx = collisionCanvas.getContext('2d');
    ctx.drawImage(this.CollisionMap, 0, 0, this.CollisionMap.width, this.CollisionMap.height);

    this.collisionMatrix = [];
    this.furnitureMatrix = [];

    const unit = this.getUnitLength();
    for (let x = 0; x < this.mapWidth; x += unit) {
      const collisionCol = [];
      const furnitureCol = [];

      for (let y = 0; y < this.mapHeight; y += unit) {
        const pixel = ctx.getImageData(x + (unit / 2), y + (unit / 2), 1, 1).data;
        if (pixel[3] === 255 && pixel[0] === 0 && pixel[1] === 0 && pixel[2] === 0) {
          collisionCol.push(1);
        } else {
          collisionCol.push(0);
        }

        if (pixel[3] === 255 && pixel[0] === 255 && pixel[1] === 0 && pixel[2] === 0) {
          furnitureCol.push('furniture-game-table');
        } else {
          furnitureCol.push(undefined);
        }
      }
      this.collisionMatrix.push(collisionCol);
      this.furnitureMatrix.push(furnitureCol);
    }
  }

  initComposite() {
    this.mapCache = document.createElement('canvas');
    this.mapCache.width = this.mapWidth;
    this.mapCache.height = this.mapHeight;

    this.refreshComposite();
  }

  refreshComposite() {
    const ctx = this.mapCache.getContext('2d');

    ctx.clearRect(0, 0, this.mapWidth, this.mapHeight);
    ctx.drawImage(this.mapImage, 0, 0, this.mapWidth, this.mapHeight);

    if (this.furnitureFactory !== undefined) {
      const unit = this.getUnitLength();
      for (let x = 0; x * unit < this.mapWidth; x += 1) {
        for (let y = 0; y * unit < this.mapHeight; y += 1) {
          const item = this.furnitureMatrix[x][y];
          if (item !== undefined) {
            this.furnitureFactory.getFurniture(item).drawAt(ctx, x * unit, y * unit, unit, unit);
          }
        }
      }
    }
  }

  initGridCache() {
    const canvas = document.createElement('canvas');
    canvas.width = this.mapWidth;
    canvas.height = this.mapHeight;

    const ctx = canvas.getContext('2d');
    const unit = this.getUnitLength();
    ctx.strokeStyle = 'black';
    for (let x = 0; x * unit < this.mapWidth; x += 1) {
      for (let y = 0; y * unit < this.mapHeight; y += 1) {
        if (!this.checkCollision(x * GameConstants.UNIT, y * GameConstants.UNIT)) {
          ctx.strokeRect(x * unit, y * unit, unit, unit);
        }
      }
    }
    this.gridCache = new Image();
    this.gridCache.src = canvas.toDataURL('image/png');
  }

  draw(ctx, camContext) {
    if (this.mapImage === undefined || this.mapCache === undefined) {
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
    ctx.drawImage(this.mapCache, scale * (camContext.x + drawOffsetX),
      scale * (camContext.y + drawOffsetY),
      scale * camContext.viewportWidth,
      scale * camContext.viewportHeight,
      drawOffsetX, drawOffsetY, camContext.viewportWidth, camContext.viewportHeight);
  }

  drawGrid(ctx, camContext) {
    if (this.gridCache === undefined) {
      this.initGridCache();
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
    ctx.drawImage(this.gridCache, scale * (camContext.x + drawOffsetX),
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
    return this.collisionMatrix[x][y] === 1 || this.furnitureMatrix[x][y] !== undefined;
  }

  hookFurnitureFactory(factory) {
    this.furnitureFactory = factory;
  }

  normaliseCoordinates(worldX, worldY) {
    const scale = this.getUnitLength() / GameConstants.UNIT;
    const scaledX = worldX * scale;
    const scaledY = worldY * scale;

    if (scaledX < 0 || scaledY < 0 || scaledX > this.mapWidth || scaledY > this.mapHeight) {
      return undefined;
    }
    const x = Math.floor(worldX / GameConstants.UNIT);
    const y = Math.floor(worldY / GameConstants.UNIT);
    return { x, y };
  }

  getFurniture(worldX, worldY) {
    const { x, y } = this.normaliseCoordinates(worldX, worldY);
    return this.furnitureMatrix[x][y];
  }

  setFurnitureAt(worldX, worldY, furnitureId) {
    const { x, y } = this.normaliseCoordinates(worldX, worldY);
    if (this.collisionMatrix[x][y] === 1) {
      return; // Not allowed to place on colliders
    }
    this.furnitureMatrix[x][y] = furnitureId;
    this.refreshComposite();
  }
}
