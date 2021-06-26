import SpriteManager from '../../managers/sprite-manager.js';

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
    this.background = SpriteManager.getInstance().getSprite('panel');
    this.msg = this.spectateMode ? MSG_SPECTATE : MSG_PLACEMENT;
    this.buttonBounds = undefined;
    this.cache = document.createElement('canvas');
    this.cacheCtx = this.cache.getContext('2d');
    this.cachedProps = undefined;
  }

  setState(state) {
    if (!this.spectateMode) { // Only Change msg when not in spectate mode
      if (state === 0) {
        this.msg = MSG_PLACEMENT;
      } else if (state === 1) {
        this.msg = MSG_TURN1;
      } else if (state === 2) {
        this.msg = MSG_TURN2;
      } else if (state === 3) {
        this.msg = MSG_WIN1;
      } else if (state === 4) {
        this.msg = MSG_WIN2;
      }
    }
    this.state = state;
  }

  updateShots(shots) {
    this.shots = shots;
  }

  attachFireHandler(handler) {
    this.fireHandler = handler;
  }

  draw(ctx, x, y, width, height) {
    if (this.cachedProps === undefined
      || this.cachedProps.width !== width
      || this.cachedProps.height !== height
      || this.cachedProps.state !== this.state
      || this.cachedProps.shots !== this.shots) {
      // Redraw on canvas
      this.cache.width = width;
      this.cache.height = height;

      const boxWidth = (width / 2) - 20;
      const { cacheCtx } = this;
      this.background.drawAt(cacheCtx, 0, 0, boxWidth, height);
      this.background.drawAt(cacheCtx, boxWidth + 40, 0, boxWidth, height);

      cacheCtx.fillStyle = '#000';
      cacheCtx.strokeStyle = '#000';
      cacheCtx.font = '2rem Arial';
      const dimens = cacheCtx.measureText(this.msg);
      const fontHeight = dimens.fontBoundingBoxAscent + dimens.fontBoundingBoxDescent;
      const marginLeft = Math.floor((boxWidth / 2) - (dimens.width / 2));
      const marginTop = Math.floor((height / 2) + (fontHeight / 2));
      cacheCtx.fillText(this.msg, marginLeft, marginTop);

      if (this.state === 1) {
        this.cachedProps = {
          x,
          y,
          width,
          height,
          state: this.state,
          shots: this.shots,
        };

        const shotsX = Math.floor((boxWidth * 1.5) + 40 - (cacheCtx.measureText(`${this.shots} shots left`).width / 2));
        cacheCtx.fillText(`${this.shots} shots left`, shotsX, (height / 2) - 5);

        const fireTextWidth = Math.ceil(cacheCtx.measureText('Fire').width);
        const fireBtnWidth = fireTextWidth + 40;
        const fireX = Math.floor((boxWidth * 1.5) + 40 - (fireBtnWidth / 2));
        cacheCtx.strokeRect(fireX, height / 2 + 10, fireBtnWidth, fontHeight + 10);
        cacheCtx.fillText('Fire', fireX + 20, (height / 2) + 5 + fontHeight);
        this.recalculateButtonBounds(x, y);
      }
    }

    ctx.drawImage(this.cache, x, y);
    if (this.cachedProps.x !== x || this.cachedProps.y !== y) {
      this.recalculateButtonBounds(x, y);
      this.cachedProps.x = x;
      this.cachedProps.y = y;
    }
  }

  recalculateButtonBounds(x, y) {
    const boxWidth = (this.cachedProps.width / 2) - 20;
    const dimens = this.cacheCtx.measureText('Fire');
    const fireTextWidth = Math.ceil(dimens.width);
    const fontHeight = dimens.fontBoundingBoxAscent + dimens.fontBoundingBoxDescent;
    const fireBtnWidth = fireTextWidth + 40;
    const fireX = Math.floor((boxWidth * 1.5) + 40 - (fireBtnWidth / 2));
    this.buttonBounds = [x + fireX, y + this.cachedProps.height / 2 + 10,
      fireBtnWidth, fontHeight + 10];
  }

  handleEvent(evtId, evt) {
    if (this.state !== 1 || this.buttonBounds === undefined) {
      return;
    }

    if (evt.clientX > this.buttonBounds[0]
      && evt.clientX < this.buttonBounds[0] + this.buttonBounds[2]
      && evt.clientY > this.buttonBounds[1]
      && evt.clientY < this.buttonBounds[1] + this.buttonBounds[3]) {
      if (this.fireHandler !== undefined) {
        this.fireHandler();
      }
    }
  }
}
