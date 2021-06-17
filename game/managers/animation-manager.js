import PlayerManager from './player-manager.js';
import MapManager from './map-manager.js';
import GameConstants from '../game-constants.js';

class CameraContext {
  constructor(viewportWidth, viewportHeight) {
    this.x = 0;
    this.y = 0;
    this.oldX = 0;
    this.oldY = 0;
    this.newX = 0;
    this.newY = 0;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  updateViewport(dimens) {
    // Recenter
    this.x -= (dimens.width - this.viewportWidth) / 2;
    this.y -= (dimens.height - this.viewportHeight) / 2;
    this.viewportWidth = dimens.width;
    this.viewportHeight = dimens.height;
  }

  animate(delta) {
    if (this.newX - this.x === 0 && this.newY - this.y === 0) return;

    const stdDeltaX = (this.newX - this.oldX) / 24;
    const stdDeltaY = (this.newY - this.oldY) / 24;

    if (Math.abs(this.newX - this.x) > Math.abs(stdDeltaX)) {
      this.x += stdDeltaX * (delta / 16.66667);
      return;
    }
    if (Math.abs(this.newY - this.y) > Math.abs(stdDeltaY)) {
      this.y += stdDeltaY * (delta / 16.66667);
      return;
    }

    this.x = this.newX;
    this.y = this.newY;
    this.oldX = this.x;
    this.oldY = this.y;
  }

  moveContext(newX, newY) {
    this.oldX = this.x;
    this.oldY = this.y;
    this.newX = newX;
    this.newY = newY;
  }

  moveContextToGrid(newX, newY) {
    this.oldX = this.x;
    this.oldY = this.y;
    this.newX = newX * MapManager.getInstance().getCurrentMap().getGridLength();
    this.newY = newY * MapManager.getInstance().getCurrentMap().getGridLength();
  }

  centerOn(x, y) {
    this.x = x - this.viewportWidth / 2;
    this.y = y - this.viewportHeight / 2;
  }
}

/* function drawGrids(height, width, gridLength) {
  let ctx = document.getElementById('game').getContext('2d');
  for (let i = 0; i < height; i += gridLength) {
    for (let ii = 0; ii < width; ii += gridLength) {
      ctx.beginPath();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = '1';
      ctx.rect(i, ii, gridLength, gridLength);
      ctx.stroke();
    }
  }
} */

class UILayer {
  constructor() {
    this.domElement = document.getElementById('ui-overlay');
    this.elements = [];
  }

  addElement(element) {
    this.elements.push(element);
    this.domElement.appendChild(element.getDOMNode());
  }
}

class GameLayer {
  constructor() {
    this.drawables = [];
  }

  register(game) {
    this.drawables.push(game);
  }

  render(ctx, cam) {
    this.drawables.forEach((x) => x.draw(ctx, cam));
  }

  // eslint-disable-next-line class-methods-use-this
  propagateEvent(eventID, event, camContext) {
    this.drawables.forEach((x) => {
      if (x.handleEvent) {
        x.handleEvent(eventID, event, camContext);
      }
    });
  }
}

let instance;
class Renderer {
  constructor() {
    this.lastUpdate = 0;
    this.lastMajorUpdate = 0;
    this.haltRender = false;
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.uiLayer = new UILayer();
    this.gameLayer = new GameLayer();
    this.eventListeners = [];

    this.dimens = {
      width: this.canvas.width,
      height: this.canvas.height,
    };

    this.cameraContext = new CameraContext(this.dimens.width, this.dimens.height);
  }

  init() {
    this.dimens = {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    };

    this.synchronizeCanvasSize();
    this.cameraContext.updateViewport(this.dimens);
    window.addEventListener('resize', (() => {
      this.dimens = {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      };

      this.synchronizeCanvasSize();
      this.cameraContext.updateViewport(this.dimens);
    }));
  }

  // eslint-disable-next-line class-methods-use-this
  propagateEvent(eventID, event) {
    this.gameLayer.propagateEvent(eventID, event, this.cameraContext);
  }

  render(timestamp) {
    let majorUpdate = false;
    const delta = timestamp - this.lastUpdate;

    if (timestamp - this.lastMajorUpdate > 66) {
      this.lastMajorUpdate = timestamp;
      majorUpdate = true;
    }

    const { ctx } = this;
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, this.dimens.width, this.dimens.height);

    // Draw using current camera context
    const camContext = this.cameraContext;
    if (MapManager.getInstance().getCurrentMap() !== undefined) {
      MapManager.getInstance().getCurrentMap().draw(ctx, camContext);
    }

    PlayerManager.getInstance().getPlayers().forEach((player) => {
      player.drawAt(ctx, player.x, player.y, GameConstants.UNIT, GameConstants.UNIT, camContext);
      player.animate(delta, majorUpdate);
    });

    // Game Renderer
    this.gameLayer.render(this.ctx, camContext);

    // Update Camera
    camContext.animate(delta);

    this.lastUpdate = timestamp;
    if (!this.haltRender) {
      window.requestAnimationFrame(this.render.bind(this));
    }
  }

  getCameraContext() {
    return this.cameraContext;
  }

  nudgeCamera(deltaX, deltaY) {
    this.moveCamera(this.cameraContext.x + deltaX, this.cameraContext.y + deltaY);
  }

  moveCamera(x, y) {
    this.cameraContext.moveContext(x, y);
  }

  synchronizeCanvasSize() {
    this.canvas.width = this.dimens.width;
    this.canvas.height = this.dimens.height;
  }

  getUILayer() {
    return this.uiLayer;
  }

  getGameLayer() {
    return this.gameLayer;
  }

  static getInstance() {
    if (instance === undefined) {
      instance = new Renderer();
    }
    return instance;
  }
}

export default Renderer.getInstance();
