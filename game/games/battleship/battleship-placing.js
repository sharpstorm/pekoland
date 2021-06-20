import BattleshipBoard from './battleship-board.js';

const TYPES = [
  BattleshipBoard.SHIPTYPE.CARRIER,
  BattleshipBoard.SHIPTYPE.BATTLESHIP,
  BattleshipBoard.SHIPTYPE.CRUISER,
  BattleshipBoard.SHIPTYPE.SUBMARINE,
  BattleshipBoard.SHIPTYPE.DESTROYER,
];

const DISPLAY_NAME = ['Aircraft Carrier', 'Battleship', 'Cruiser', 'Submarine', 'Destroyer'];

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
  }

  draw(ctx, x, y, size) {
    this.board.draw(ctx, x, y, size);

    if (!this.done) {
      // Draw UI
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.rect(x + size + this.margin, y, size, size);
      ctx.stroke();
      ctx.fill();

      ctx.fillStyle = '#FFF';
      ctx.font = '1rem Arial';
      ctx.fillText('Placing', x + size + this.margin + 20, y + 20);

      for (let i = 0; i < 5; i += 1) {
        if (i === this.currentPlacement) {
          ctx.strokeStyle = '#F00';
        } else {
          ctx.strokeStyle = '#FFF';
        }
        ctx.strokeRect(x + size + this.margin + 10, y + 90 + (i * 50), 200, 30);
        ctx.fillText(DISPLAY_NAME[i], x + size + this.margin + 20, y + 110 + (i * 50));
      }

      ctx.strokeStyle = (this.currentOrient === BattleshipBoard.ORIENTATION.ORIENT_HORI) ? '#F00' : '#FFF';
      ctx.strokeRect(x + size + this.margin + 10, y + 450, 200, 30);
      ctx.fillText('Horizontal', x + size + this.margin + 20, y + 470);

      ctx.strokeStyle = (this.currentOrient === BattleshipBoard.ORIENTATION.ORIENT_VERT) ? '#F00' : '#FFF';
      ctx.strokeRect(x + size + this.margin + 10, y + 500, 200, 30);
      ctx.fillText('Vertical', x + size + this.margin + 20, y + 520);

      ctx.strokeStyle = '#FFF';
      ctx.strokeRect(x + size + this.margin + 10, y + 570, 200, 30);
      ctx.fillText('Done', x + size + this.margin + 20, y + 590);
    } else {
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.rect(x + size + this.margin, y, size, size);
      ctx.stroke();
      ctx.fill();

      ctx.fillStyle = '#FFF';
      ctx.font = '2rem Arial';
      ctx.fillText('Waiting for Opponent to Place', x + size + this.margin + 40, y + 40);
    }
  }

  handleEvent(evtId, evt, drawParams) {
    if (this.done) {
      return;
    }

    if (evtId === 'click') {
      const { boardSize, marginLeft, marginTop } = drawParams;
      const x = marginLeft;
      const y = marginTop + this.titleHeight;
      for (let i = 0; i < 5; i += 1) {
        if (evt.clientX > x + boardSize + this.margin + 10
          && evt.clientX < x + boardSize + this.margin + 200
          && evt.clientY > y + 90 + (i * 50)
          && evt.clientY < y + 90 + (i * 50) + 30) {
          this.currentPlacement = i;
        }
      }

      if (evt.clientX > x + boardSize + this.margin + 10
        && evt.clientX < x + boardSize + this.margin + 200) {
        if (evt.clientY > y + 450 && evt.clientY < y + 480) {
          this.currentOrient = BattleshipBoard.ORIENTATION.ORIENT_HORI;
        } else if (evt.clientY > y + 500 && evt.clientY < y + 530) {
          this.currentOrient = BattleshipBoard.ORIENTATION.ORIENT_VERT;
        } else if (evt.clientY > y + 570 && evt.clientY < y + 600) {
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
