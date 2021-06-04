import ChatManager from './chat-manager.js';
import PlayerManager from './player-manager.js';
import MapManager from './map-manager.js';

const chatManager = ChatManager.getInstance();

let instance;
class Renderer {
  constructor() {
    this.lastUpdate = 0;
    this.lastMajorUpdate = 0;
    this.haltRender = false;
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.dimens = {
      width: this.canvas.width,
      height: this.canvas.height
    };

    this.cameraContext = new CameraContext(this.dimens.width, this.dimens.height);
  }

  init() {
    this.dimens = {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight
    };

    this.canvas.width = this.dimens.width;
    this.canvas.height = this.dimens.height;
    this.cameraContext.updateViewport(this.dimens);

    window.addEventListener('resize', (() => {
      this.dimens = {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
      };

      this.canvas.width = this.dimens.width;
      this.canvas.height = this.dimens.height;
      this.cameraContext.updateViewport(this.dimens);
    }).bind(this));
  }

  render(timestamp) {
    let majorUpdate = false;
    let delta = timestamp - this.lastUpdate;

    if (timestamp - this.lastMajorUpdate > 66) {
      this.lastMajorUpdate = timestamp;
      majorUpdate = true;
    }

    let ctx = this.ctx;
    ctx.clearRect(0, 0, this.dimens.width, this.dimens.height);

    // Draw using current camera context
    let camContext = this.cameraContext;
    if (MapManager.getInstance().getCurrentMap() !== undefined) {
      MapManager.getInstance().getCurrentMap().draw(ctx, camContext);
    }

    PlayerManager.getInstance().getPlayers().forEach(player => {
      player.drawAt(ctx, player.x, player.y, 50, 50, camContext);
      player.animate(delta, majorUpdate);
    });

    // Draw UI
    /* if (chatManager.chatting) {
      drawExpandedTextBox(ctx);
    } else {
      drawTextBox(ctx);
    } */

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

  static getInstance() {
    if (instance === undefined) {
      instance = new Renderer();
    }
    return instance;
  }
}

function drawGrids(height, width, gridLength) {
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
}

function drawTextBox(ctx) {
  chatManager.chatting = false;  
  ctx.strokeStyle = 'white';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 1;
  ctx.font = '15px Arial';

  ctx.beginPath();
  ctx.rect(0, 485, 500, 15);
  ctx.stroke();
  ctx.fill();

  //Plus sign behind
  ctx.fillRect(485, 485, 15, 15);
  ctx.strokeStyle = 'white';
  ctx.strokeText('+', 488.5, 497.5);

  //To who
  ctx.fillRect(0, 485, 50, 15);
  ctx.font = 'normal 10px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.fillText('All', 18, 497);
}

function drawExpandedTextBox(ctx) {
  chatManager.chatting = true;

  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 1;
  ctx.font = '15px Arial';

  ctx.beginPath();
  ctx.rect(0, 485, 500, 15);
  ctx.stroke();
  ctx.fill();
  //Expand top for prev chat
  ctx.fillRect(0, 330, 500, 150);
  ctx.fillRect(0, 480, 500, 5);

  //Plus sign behind
  ctx.fillRect(485, 485, 15, 15);
  ctx.strokeStyle = 'white';
  ctx.strokeText('-', 490.5, 497);

  //To who
  ctx.fillRect(0, 485, 50, 15);
  ctx.font = 'normal 10px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.fillText('All', 18, 497);
  
  //typing words
  ctx.fillText(chatManager.textField, 60, 497);

  //chat history
  for (let i = 0; i < chatManager.bigChatBox.length; i++) {
    ctx.fillText(chatManager.bigChatBox[i], 5, 345 + (i * 15));
  }
}

class CameraContext {
  constructor(viewportWidth, viewportHeight) {
    this.x = 0;
    this.y = 0;
    this.oldX = 0;
    this.oldY = 0;
    this.newX = 0;
    this.newY = 0;
    this.viewportWidth = 0;
    this.viewportHeight = 0;
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

export default Renderer.getInstance();
