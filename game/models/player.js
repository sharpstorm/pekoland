import Chat from './chat.js';
import GameConstants from '../game-constants.js';
import SpriteManager from '../managers/sprite-manager.js';

const SPAWN_X = 400;
const SPAWN_Y = 1400;

export default class Player {
  constructor(userId, name, playerSprite) {
    this.userId = userId;
    this.name = name;
    this.playerSprite = playerSprite;

    this.x = SPAWN_X;
    this.y = SPAWN_Y;
    this.newX = SPAWN_X;
    this.newY = SPAWN_Y;
    this.oldX = SPAWN_X;
    this.oldY = SPAWN_Y;
    this.moveX = 0;
    this.moveY = 0;
    this.direction = Player.Direction.DOWN;
    this.isAnimating = false;
    this.currentFrame = 6;
    this.chat = new Chat();
  }

  drawAt(ctx, x, y, width, height, cameraContext) {
    ctx.fillStyle = 'black';
    ctx.globalAlpha = 0.7;
    ctx.fillRect(this.x - cameraContext.x, this.y - cameraContext.y + 85, 100, 23);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = 'white';
    ctx.strokeRect(this.x - cameraContext.x, this.y - cameraContext.y + 85, 100, 23);

    ctx.fillStyle = 'white';
    ctx.font = '15px Arial';
    ctx.fillText(this.name.padStart(12, ' '), this.x - cameraContext.x, this.y - cameraContext.y + 100);

    const sprite = this.playerSprite.getSpriteByDirection(Player.DirectionToIntMap[this.direction])
      .getSpriteAtFrame(this.currentFrame);

    // Player should be 80% of box
    const spriteScale = Math.min((0.6 * width) / sprite.width, (0.6 * height) / sprite.height);
    const marginX = Math.round((width - spriteScale * sprite.width) / 2);
    const marginY = Math.round((height - spriteScale * sprite.height) / 2);

    sprite.drawAt(ctx,
      this.x - cameraContext.x + marginX,
      this.y - cameraContext.y + marginY,
      spriteScale * sprite.width,
      spriteScale * sprite.height);

    this.chat.drawAt(ctx,
      this.x - cameraContext.x + marginX + 40,
      this.y - cameraContext.y + marginY - 30);
  }

  moveTo(newX, newY) {
    this.oldX = this.x;
    this.oldY = this.y;
    this.newX = newX;
    this.newY = newY;
    this.isAnimating = true;
    this.currentFrame = 0;
  }

  moveImmediate(newX, newY) {
    this.oldX = newX;
    this.oldY = newY;
    this.newX = newX;
    this.newY = newY;
    this.x = newX;
    this.y = newY;
  }

  moveToGrid(x, y) {
    this.oldX = (x - 1) * GameConstants.UNIT;
    this.oldY = (y - 1) * GameConstants.UNIT;
    this.newX = (x - 1) * GameConstants.UNIT;
    this.newY = (y - 1) * GameConstants.UNIT;
    this.x = (x - 1) * GameConstants.UNIT;
    this.y = (y - 1) * GameConstants.UNIT;
  }

  getGridCoord() {
    return { x: this.x / GameConstants.UNIT + 1, y: this.y / GameConstants.UNIT + 1 };
  }

  animate(delta, majorUpdate) {
    if (!this.isAnimating) return;
    if (this.currentFrame < 6) {
      if (Math.abs(this.newX - this.x) > 0.00001) {
        this.x += ((this.newX - this.oldX) / 24) * (delta / 16.66667);
      } else if (Math.abs(this.newY - this.y) > 0.00001) {
        this.y += ((this.newY - this.oldY) / 24) * (delta / 16.66667);
      }
      if (majorUpdate) {
        this.currentFrame += 1;
      }
      return;
    }
    this.x = this.newX;
    this.y = this.newY;
    this.oldX = this.x;
    this.oldY = this.y;
    this.isAnimating = false;
  }

  changeSprite(spriteId) {
    this.playerSprite = SpriteManager.getInstance().getSprite(spriteId);
  }
}

Player.Direction = {
  UP: 'up',
  RIGHT: 'right',
  DOWN: 'down',
  LEFT: 'left',
};

Player.DirectionToIntMap = {
  up: 0,
  right: 1,
  down: 2,
  left: 3,
};
