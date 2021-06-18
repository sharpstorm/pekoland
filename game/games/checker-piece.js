export default class CheckerPiece {
  constructor(player) {
    this.player = player;
    this.diameter = 50;
    this.king = false;
    this.color = (player === 1) ? 'red' : 'blue';
  }

  drawAt(ctx, x, y) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#FFF';
    ctx.arc(x + this.diameter * 1.1, y
      + this.diameter * 1.1, this.diameter, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
    if (this.king) {
      ctx.beginPath();
      ctx.fillStyle = 'black';
      ctx.arc(x + this.diameter * 1.1, y
        + this.diameter * 1.1, 30, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    }
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
