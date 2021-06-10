export default class CheckerPiece {
  constructor(player, x, y) {
    this.player = player;
    this.x = x;
    this.y = y;
    this.diameter = 50;
    this.isKing = false;
  }

  drawAt(ctx) {
    ctx.beginPath();
    if (this.player === 'Player 1') {
      ctx.fillStyle = 'red';
    } else {
      ctx.fillStyle = 'blue';
    }
    ctx.strokeStyle = '#FFF';
    ctx.arc(this.x + this.diameter * 1.1, this.y
      + this.diameter * 1.1, this.diameter, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
    if (this.isKing) {
      ctx.beginPath();
      ctx.fillStyle = 'black';
      ctx.arc(this.x + this.diameter * 1.1, this.y
        + this.diameter * 1.1, 30, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    }
  }
}
