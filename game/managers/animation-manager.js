import ChatManager from './chat-manager.js';
import PlayerManager from './player-manager.js';
import MapManager from './map-manager.js';
import GameConstants from '../game-constants.js';
import { drawChecker } from '../games/checkers.js';

const chatManager = ChatManager.getInstance();

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

function getUIState(camContext) {
  return {
    viewportHeight: camContext.viewportHeight,
    viewportWidth: camContext.viewportWidth,
    chatting: chatManager.chatting,
    text: chatManager.textField,
    history: chatManager.bigChatBox,
  };
}

function drawTextBox(ctx, uiState) {
  ctx.strokeStyle = '#FFF';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 1;
  ctx.font = '15px Arial';

  ctx.beginPath();
  ctx.rect(0, uiState.viewportHeight - 20, 500, 20);
  ctx.stroke();
  ctx.fill();

  if (uiState.chatting === true) {
    // Expand top for prev chat
    ctx.fillRect(0, uiState.viewportHeight - 170, 500, 150);
  }

  // Plus sign behind
  ctx.fillRect(480, uiState.viewportHeight - 20, 20, 20);
  ctx.strokeStyle = '#FFF';
  ctx.strokeText('+', 487, uiState.viewportHeight - 3);

  // To who
  ctx.fillRect(0, uiState.viewportHeight - 20, 50, 20);
  ctx.font = 'normal 10px Arial';
  ctx.fillStyle = '#FFF';
  ctx.fillText('All', 18, uiState.viewportHeight - 5);

  if (uiState.chatting === true) {
    // typing words
    ctx.fillText(uiState.text, 60, uiState.viewportHeight - 5);

    // chat history
    uiState.history.forEach((x, idx) => {
      ctx.fillText(x, 5, uiState.viewportHeight - 155 + (idx * 15));
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
    this.uiCanvas = document.getElementById('ui');
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.uiCtx = this.uiCanvas.getContext('2d');

    this.dimens = {
      width: this.canvas.width,
      height: this.canvas.height,
    };
    this.lastUIState = undefined;

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

    // Draw UI
    if (this.isUILayerDirty()) {
      this.lastUIState = getUIState(this.cameraContext);
      this.uiCtx.clearRect(0, 0, this.dimens.width, this.dimens.height);
      drawTextBox(this.uiCtx, this.lastUIState);
    }

    // Checkers
    drawChecker(this.uiCtx, this.lastUIState);

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

  isUILayerDirty() {
    const oldState = this.lastUIState;
    if (oldState === undefined) {
      return true;
    }

    const curState = getUIState(this.cameraContext);
    return (curState.viewportHeight !== oldState.viewportHeight
      || curState.viewportWidth !== oldState.viewportWidth
      || curState.chatting !== oldState.chatting
      || curState.text !== oldState.text
      || curState.history.length !== oldState.history.length);
  }

  synchronizeCanvasSize() {
    this.canvas.width = this.dimens.width;
    this.canvas.height = this.dimens.height;
    this.uiCanvas.width = this.dimens.width;
    this.uiCanvas.height = this.dimens.height;
  }

  static getInstance() {
    if (instance === undefined) {
      instance = new Renderer();
    }
    return instance;
  }
}

export default Renderer.getInstance();
