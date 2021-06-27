import SpriteManager from '../../managers/sprite-manager.js';

export default class GridBox {
  constructor(state, checkerPiece, unitSize) {
    this.checkerPiece = checkerPiece;
    this.state = state;
    this.unitSize = unitSize;
    this.sprite = undefined;
    this.index = 0;
  }

  drawAt(ctx, x, y) {
    ctx.beginPath();
    this.sprite.drawAt(ctx, x, y, this.unitSize, this.unitSize);
    if (this.state === GridBox.State.SELECTED) {
      ctx.fillStyle = GridBox.State.SELECTED;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(x, y, this.unitSize, this.unitSize);
      ctx.globalAlpha = 1.0;
    }

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
    const aa = Math.floor(index / 8);
    if (aa % 2 === 0) {
      if (index % 2 !== 0) {
        this.sprite = SpriteManager.getInstance().getSprite('checkers-grid-brown');
      } else {
        this.sprite = SpriteManager.getInstance().getSprite('checkers-grid-black');
      }
    } else if (aa % 2 !== 0) {
      if (index % 2 !== 0) {
        this.sprite = SpriteManager.getInstance().getSprite('checkers-grid-black');
      } else {
        this.sprite = SpriteManager.getInstance().getSprite('checkers-grid-brown');
      }
    }
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
