import ChatManager from './chat-manager.js';
import PlayerManager from './player-manager.js';
import MapManager from './map-manager.js';
import CameraContext from './camera-context.js'

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
  }

  init() {
    this.canvas.width = document.documentElement.clientWidth;
    this.canvas.height = document.documentElement.clientHeight;

    this.dimens = {
      width: this.canvas.width,
      height: this.canvas.height
    };

    window.addEventListener('resize', (() => {
      this.canvas.width = document.documentElement.clientWidth;
      this.canvas.height = document.documentElement.clientHeight;
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
    let camContext = CameraContext.getInstance();
    if (MapManager.getInstance().getCurrentMap() !== undefined) {
      MapManager.getInstance().getCurrentMap().draw(ctx, camContext);
    }

    PlayerManager.getInstance().getPlayers().forEach(player => {
      player.drawAt(ctx, player.x, player.y, 50, 50, camContext);
      player.animate(delta, majorUpdate);
    });

    // Draw UI
    if (chatManager.chatting) {
      drawExpandedTextBox(ctx);
    } else {
      drawTextBox(ctx);
    }

    // Update Camera
    camContext.animate(delta);

    this.lastUpdate = timestamp;
    if (!this.haltRender) {
      window.requestAnimationFrame(this.render.bind(this));
    }
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

export default Renderer.getInstance();
