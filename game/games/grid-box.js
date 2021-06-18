export default class GridBox {
  constructor(state, checkerPiece, unitSize) {
    this.checkerPiece = checkerPiece;
    this.state = state;
    this.unitSize = unitSize;

    this.index = 0;
  }

  drawAt(ctx, x, y) {
    ctx.beginPath();
    ctx.fillStyle = this.state;
    ctx.rect(x, y, this.unitSize, this.unitSize);
    ctx.stroke();
    ctx.fill();
    if (this.hasPiece()) {
      this.checkerPiece.drawAt(ctx, x, y);
    }
  }

  setXY(x, y) {
    this.x = x;
    this.y = y;
    if (this.hasPiece()) {
      this.checkerPiece.x = x;
      this.checkerPiece.y = y;
    }
  }

  setIndex(index) {
    this.index = index;
  }

  getIndex() {
    return this.index;
  }

  getCoordinates() {
    return {
      x: this.index % 8,
      y: Math.floor(this.index / 8),
    };
  }

  setState(state) {
    this.state = state;
  }

  getState() {
    return this.state;
  }

  assignPiece(checkerPiece) {
    this.checkerPiece = checkerPiece;
    this.checkerPiece.x = this.x;
    this.checkerPiece.y = this.y;
  }

  removePiece() {
    this.checkerPiece = undefined;
  }

  getPiece() {
    return this.checkerPiece;
  }

  hasPiece() {
    return this.checkerPiece !== undefined;
  }

  movePieceTo(newGrid) {
    newGrid.assignPiece(this.checkerPiece);
    this.removePiece();
  }
}

GridBox.State = {
  UNSELECTED: '#000',
  SELECTABLE: 'green',
};
