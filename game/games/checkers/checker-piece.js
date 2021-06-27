import SpriteManager from '../../managers/sprite-manager.js';

export default class CheckerPiece {
  constructor(player) {
    this.player = player;
    this.diameter = 90;
    this.king = false;
    this.color = (player === 1) ? 'red' : 'blue';
    this.sprite = (player === 1) ? SpriteManager.getInstance().getSprite('checkers-piece-red-normal') : SpriteManager.getInstance().getSprite('checkers-piece-black-normal');
    this.kingSprite = (player === 1) ? SpriteManager.getInstance().getSprite('checkers-piece-red-king') : SpriteManager.getInstance().getSprite('checkers-piece-black-king');
  }

  drawAt(ctx, x, y) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#FFF';
    if (this.king) {
      this.kingSprite.drawAt(ctx, x + 8, y + 5, this.diameter, this.diameter);
    } else {
      this.sprite.drawAt(ctx, x + 8, y + 5, this.diameter, this.diameter);
    }

    ctx.stroke();
    ctx.fill();
  }

  getPlayer() {
    return this.player;
  }

  setKing(king) {
    this.king = king;
  }

  isKing() {
    return this.king;
  }
}
