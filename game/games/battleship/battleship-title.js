const MSG_PLACEMENT = 'Place Your Ships';
const MSG_TURN1 = 'Choose Spots to Fire At';
const MSG_TURN2 = 'Waiting for Opponent to Fire';
const MSG_WIN1 = 'Player 1 has won!';
const MSG_WIN2 = 'Player 2 has won!';
const MSG_SPECTATE = 'Spectating Match';

export default class BattleshipTitleBoard {
  constructor(spectateMode) {
    this.spectateMode = spectateMode;

    this.state = 0;
    this.shots = 0;
    this.fireHandler = undefined;
  }

  setState(state) {
    this.state = state;
  }

  draw(ctx, x, y, width, height) {
    ctx.fillStyle = '#000';
    ctx.strokeStyle = '#CCC';
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.stroke();
    ctx.fill();

    ctx.font = '2rem Arial';
    ctx.fillStyle = '#FFF';
    if (this.spectateMode === true) {
      ctx.fillText(MSG_SPECTATE, x, y + height / 2);
    } else if (this.state === 0) {
      ctx.fillText(MSG_PLACEMENT, x, y + height / 2);
    } else if (this.state === 1) {
      ctx.fillText(MSG_TURN1, x, y + height / 2);
    } else if (this.state === 2) {
      ctx.fillText(MSG_TURN2, x, y + height / 2);
    } else if (this.state === 3) {
      ctx.fillText(MSG_WIN1, x, y + height / 2);
    } else if (this.state === 4) {
      ctx.fillText(MSG_WIN2, x, y + height / 2);
    }

    if (this.state === 1) {
      ctx.fillText(`${this.shots} shots left`, x + width / 2 + 20, y + height / 2 - 10);
      ctx.strokeRect(x + width / 2, y + height / 2, 100, 40);
      ctx.fillText('Fire', x + width / 2 + 20, y + height / 2 + 30);
    }
  }

  updateShots(shots) {
    this.shots = shots;
  }

  attachFireHandler(handler) {
    this.fireHandler = handler;
  }

  handleEvent(evtId, evt, x, y, width, height) {
    if (this.state !== 1) {
      return;
    }

    if (evt.clientX > x + (width / 2) && evt.clientX < x + (width / 2) + 100
      && evt.clientY > y + (height / 2) && evt.clientY < y + (height / 2) + 40) {
      if (this.fireHandler !== undefined) {
        this.fireHandler();
      }
    }
  }
}
