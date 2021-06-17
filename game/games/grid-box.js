export default class Grid {
  constructor(x, y, color, checkerPiece, hasPiece) {
    this.x = x;
    this.y = y;
    this.checkerPiece = checkerPiece;
    this.hasPiece = hasPiece;
    this.color = color;
    this.index = 0;
  }

  drawAt(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.rect(this.x, this.y, 900 / 8, 900 / 8);
    ctx.stroke();
    ctx.fill();
    if (this.hasPiece) {
      this.checkerPiece.drawAt(ctx);
    }
  }

  setXY(x, y) {
    this.x = x;
    this.y = y;
    if (this.hasPiece) {
      this.checkerPiece.x = x;
      this.checkerPiece.y = y;
    }
  }

  setIndex(index) {
    this.index = index;
  }

  setColor(color) {
    this.color = color;
  }

  assignPiece(checkerPiece) {
    this.hasPiece = true;
    this.checkerPiece = checkerPiece;
    this.checkerPiece.x = this.x;
    this.checkerPiece.y = this.y;
  }

  removePiece() {
    this.checkerPiece = undefined;
    this.hasPiece = false;
  }

  movePieceTo(newGrid) {
    newGrid.assignPiece(this.checkerPiece);
    this.removePiece();
  }

  getDiagonals(side) {
    let l;
    let r;

    if (side === 'bottom') {
      if (this.index % 8 === 0) {
        r = undefined;
        l = this.index + 9;
      } else if (this.index % 8 === 7) {
        l = undefined;
        r = this.index + 7;
      } else {
        l = this.index + 9;
        r = this.index + 7;
      }
    } else if (side === 'top') {
      if (this.index % 8 === 0) {
        r = undefined;
        l = this.index - 7;
      } else if (this.index % 8 === 7) {
        l = undefined;
        r = this.index - 9;
      } else {
        l = this.index - 7;
        r = this.index - 9;
      }
    }

    if (l > 63 || l < 0) {
      l = undefined;
    }
    if (r > 63 || r < 0) {
      r = undefined;
    }
    return { right: r, left: l };
  }
}
