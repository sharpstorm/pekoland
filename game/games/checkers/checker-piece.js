import SpriteManager from '../../managers/sprite-manager.js';

export default class CheckerPiece {
  constructor(player) {
    this.player = player;
    this.diameter = 90;
    this.king = false;
    this.color = (player === 1) ? 'red' : 'blue';
    this.sprite = (this.color === 'red') ? SpriteManager.getInstance().getSprite('checkers-piece-red-normal') : SpriteManager.getInstance().getSprite('checkers-piece-black-normal');
  }

  drawAt(ctx, x, y) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#FFF';
    this.sprite.drawAt(ctx, x + (8), y + (5), this.diameter, this.diameter);
    ctx.stroke();
    ctx.fill();
  }

  getPlayer() {
    return this.player;
  }

  setKing(king) {
    this.king = king;
    this.sprite = (this.color === 'red') ? SpriteManager.getInstance().getSprite('checkers-piece-red-king') : SpriteManager.getInstance().getSprite('checkers-piece-black-king');
  }

  isKing() {
    return this.king;
  }
}
