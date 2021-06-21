import BattleshipBoard from './battleship-board.js';
import SpriteManager from '../../managers/sprite-manager.js';

const TYPES = [
  BattleshipBoard.SHIPTYPE.CARRIER,
  BattleshipBoard.SHIPTYPE.BATTLESHIP,
  BattleshipBoard.SHIPTYPE.CRUISER,
  BattleshipBoard.SHIPTYPE.DESTROYER,
  BattleshipBoard.SHIPTYPE.OILER,
];

const DISPLAY_NAME = ['Aircraft Carrier', 'Battleship', 'Cruiser', 'Destroyer', 'Oiler'];

export default class BattleshipPlacementUI {
  constructor(margin, titleHeight, board, callback) {
    this.placed = [];
    this.currentPlacement = BattleshipBoard.SHIPTYPE.CARRIER;
    this.currentOrient = BattleshipBoard.ORIENTATION.ORIENT_HORI;
    this.margin = margin;
    this.titleHeight = titleHeight;
    this.board = board;
    this.callback = callback;

    this.done = false;
    this.background = SpriteManager.getInstance().getSprite('panel');
  }

  draw(ctx, x, y, size) {
    this.board.draw(ctx, x, y, size);

    const baseX = x + size + this.margin;
    const baseY = y + 20;
    this.background.drawAt(ctx, baseX, baseY, size, size - 20);
    const height = size - 20;

    if (!this.done) {
      const padSize = Math.floor(height / 12);
      const rowHeight = Math.floor(height / 6);
      const colWidth = Math.floor(size / 2);

      // Draw UI
      ctx.font = '1.2rem Arial';
      ctx.strokeStyle = '#000';

      for (let i = 0; i < 5; i += 1) {
        const boxX = baseX + (Math.floor(i / 3) * colWidth);
        const boxY = baseY + ((i % 3) * rowHeight) + padSize;
        if (i === this.currentPlacement) {
          ctx.fillStyle = '#CCC';
          ctx.fillRect(boxX + 15, boxY + 5, colWidth - 30, rowHeight - 10);
        } else {
          ctx.strokeRect(boxX + 15, boxY + 5, colWidth - 30, rowHeight - 10);
        }
        ctx.fillStyle = '#000';
        this.drawCenterTextOn(ctx, DISPLAY_NAME[i], boxX + (colWidth / 2), boxY + (rowHeight / 2));
      }

      if (this.currentOrient === BattleshipBoard.ORIENTATION.ORIENT_HORI) {
        ctx.fillStyle = '#CCC';
        ctx.fillRect(baseX + 15, baseY + rowHeight * 4, colWidth - 30, rowHeight - 10);
      } else {
        ctx.strokeRect(baseX + 15, baseY + rowHeight * 4, colWidth - 30, rowHeight - 10);
      }
      ctx.fillStyle = '#000';
      this.drawCenterTextOn(ctx, 'Horizontal', baseX + (colWidth / 2), baseY + rowHeight * 4.5 - 5);

      if (this.currentOrient === BattleshipBoard.ORIENTATION.ORIENT_VERT) {
        ctx.fillStyle = '#CCC';
        ctx.fillRect(baseX + colWidth + 15, baseY + rowHeight * 4, colWidth - 30, rowHeight - 10);
      } else {
        ctx.strokeRect(baseX + colWidth + 15, baseY + rowHeight * 4, colWidth - 30, rowHeight - 10);
      }
      ctx.fillStyle = '#000';
      this.drawCenterTextOn(ctx, 'Vertical', baseX + colWidth * 1.5, baseY + rowHeight * 4.5 - 5);

      ctx.strokeRect(baseX + 15, baseY + rowHeight * 5 + 15, (colWidth * 2) - 30, rowHeight - 30);
      this.drawCenterTextOn(ctx, 'Done', baseX + colWidth, baseY + rowHeight * 5.5);
    } else {
      ctx.fillStyle = '#000';
      ctx.font = '2rem Arial';
      this.drawCenterTextOn(ctx, 'Waiting for Opponent to Place', baseX + (size / 2), baseY + (height / 2));
    }
  }

  // eslint-disable-next-line class-methods-use-this
  drawCenterTextOn(ctx, text, x, y) {
    const fontProps = ctx.measureText(text);
    const fontHeight = fontProps.fontBoundingBoxAscent + fontProps.fontBoundingBoxDescent;
    ctx.fillText(text, x - (fontProps.width / 2), y + (fontHeight / 2));
  }

  handleEvent(evtId, evt, drawParams) {
    if (this.done) {
      return;
    }

    if (evtId === 'click') {
      const { boardSize, marginLeft, marginTop } = drawParams;
      const x = marginLeft;
      const y = marginTop + this.titleHeight;
      const baseX = x + boardSize + this.margin;
      const baseY = y + 20;

      if (evt.clientX > baseX && evt.clientX < baseX + boardSize
        && evt.clientY > baseY && evt.clientY < baseY + boardSize) {
        // Right UI
        const height = boardSize - 20;
        const padSize = Math.floor(height / 12);
        const rowHeight = Math.floor(height / 6);
        const colWidth = Math.floor(boardSize / 2);

        if (evt.clientY > baseY + padSize && evt.clientY < baseY + padSize + rowHeight * 3) {
          // Placement
          const row = Math.floor((evt.clientY - baseY - padSize) / rowHeight);
          const col = Math.floor((evt.clientX - baseX) / colWidth);
          this.currentPlacement = row + (col * 3);
        } else if (evt.clientY > baseY + rowHeight * 4 && evt.clientY < baseY + rowHeight * 5) {
          // Orientation
          const col = Math.floor((evt.clientX - baseX) / colWidth);
          if (col === 0) {
            this.currentOrient = BattleshipBoard.ORIENTATION.ORIENT_HORI;
          } else {
            this.currentOrient = BattleshipBoard.ORIENTATION.ORIENT_VERT;
          }
        } else if (evt.clientY > baseY + rowHeight * 5 + 15
          && evt.clientY < baseY + rowHeight * 6 - 15) {
          if (this.board.validatePlacement()) {
            this.board.setShipsPlaced(true);
            this.done = true;
            this.callback();
          } else {
            alert('You have overlapping or unplaced ships!');
          }
        }
      }

      if (evt.clientX > x && evt.clientX < x + boardSize
        && evt.clientY > y && evt.clientY < y + boardSize) {
        const coords = this.board.getGridAtPosition(evt.clientX - x, evt.clientY - y, boardSize);
        if (coords !== undefined) {
          this.board.addShip(TYPES[this.currentPlacement], coords.x, coords.y, this.currentOrient);
        }
      }
    }
  }
}
