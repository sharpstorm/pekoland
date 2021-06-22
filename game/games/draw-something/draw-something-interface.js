const BOARD_SIZE = 505;
let BORDER_COLOR = 'white';

export default class DrawSomethingWhiteboard {
  constructor() {
    this.isNew = true;
    this.isDrawing = false;
    this.newY = undefined;
    this.newY = undefined;
    this.topX = undefined;
    this.topY = undefined;
    this.x = undefined;
    this.y = undefined;
    this.canv = undefined;
    this.canvContext = undefined;
    this.counter = 0;
    this.setup();
    this.freeze = false;
  }

  setup() {
    const canv = document.createElement('canvas');
    canv.id = 'whiteboard';
    canv.height = 500;
    canv.width = 500;
    this.canvCtx = canv.getContext('2d');
    this.canvCtx.fillStyle = 'black';
    this.canvCtx.fillRect(0, 0, 500, 500);
    this.canv = canv;
  }

  reset() {
    this.canvCtx.fillStyle = 'black';
    this.canvCtx.fillRect(0, 0, 500, 500);
    this.isDrawing = false;
  }

  // eslint-disable-next-line class-methods-use-this
  draw(ctx, camContext) {
    const image = new Image();
    image.src = this.canv.toDataURL('image/png');
    ctx.beginPath();
    ctx.strokeStyle = BORDER_COLOR;
    ctx.lineWidth = 5;
    ctx.fillStyle = 'white';
    const x = camContext.viewportWidth / 2 - (BOARD_SIZE / 2);
    const y = (camContext.viewportHeight / 2 - (BOARD_SIZE / 2));
    this.topX = x;
    this.topY = y;
    ctx.rect(x, y, BOARD_SIZE, BOARD_SIZE);
    ctx.stroke();
    ctx.drawImage(this.canv, x + 2.5, y + 2.5, 500, 500);

    if (this.isDrawing) {
      this.canvCtx.beginPath();
      this.canvCtx.lineWidth = 1;
      this.canvCtx.strokeStyle = 'yellow';
      this.canvCtx.moveTo(this.x, this.y);
      this.canvCtx.lineTo(this.newX, this.newY);
      this.canvCtx.stroke();
    }
    ctx.lineWidth = 1;
  }

  updateBoard(image) {
    if (!this.freeze) {
      const newImage = new Image();
      newImage.src = image;
      this.canvCtx.drawImage(newImage, 0, 0);
    }
  }

  getImage() {
    return this.canv.toDataURL('image/jpg');
  }

  handle(e) {
    if (e.type === 'mousedown') {
      this.isDrawing = true;
    }
    if (e.type === 'mouseup') {
      this.isDrawing = false;
    }
    if (e.type === 'mousemove') {
      if (this.counter > 1) {
        this.x = this.newX;
        this.y = this.newY;
        this.newX = e.x - this.topX;
        this.newY = e.y - this.topY;
        this.counter = 0;
      }
    }
    this.counter += 1;
  }
}

class DrawSomethingInputBox {
  constructor() {
    this.text = '';
    this.counter = 0;
    this.lineWidth = 1;
  }

  draw(ctx, camContext) {
    ctx.beginPath();
    ctx.fillStyle = 'white';
    const x = camContext.viewportWidth / 2 - (BOARD_SIZE / 2);
    const y = (camContext.viewportHeight / 2 - (BOARD_SIZE / 2)) + BOARD_SIZE + 25;
    ctx.rect(x, y, BOARD_SIZE, 50);
    ctx.fill();

    ctx.strokeStyle = BORDER_COLOR;
    ctx.stroke();
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();

    ctx.font = '30px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(this.text, x, y + 30);

    if (BORDER_COLOR !== 'white') {
      this.counter += 1;
    }
    if (this.counter === 20) {
      this.counter = 0;
      BORDER_COLOR = 'white';
      this.lineWidth = 1;
    }
  }

  handle(e) {
    if (e.keyCode === 8) {
      this.text = this.text.substring(0, this.text.length - 1);
    } else if (e.key.length === 1) {
      this.text += e.key;
    }
  }

  correct() {
    BORDER_COLOR = 'green';
    this.lineWidth = 5;
  }

  wrong() {
    BORDER_COLOR = 'red';
    this.lineWidth = 5;
  }

  reset() {
    this.text = '';
  }

  getWord() {
    return this.text;
  }
}

class DrawSomethingPrompt {
  constructor() {
    this.text = 'GET READY...';
  }

  draw(ctx, camContext) {
    ctx.beginPath();
    ctx.fillStyle = 'black';
    const x = camContext.viewportWidth / 2 - (BOARD_SIZE / 2);
    const y = (camContext.viewportHeight / 2 - (BOARD_SIZE / 2)) - 75;
    ctx.rect(x, y, BOARD_SIZE, 50);
    ctx.fill();

    ctx.beginPath();
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(this.text, x, y + 30);
  }

  reset() {
    this.text = 'GET READY...';
  }

  set(text) {
    this.text = `${text}`;
  }
}

const TIMER_DURATION = 30;
class DrawSomethingTimer {
  constructor() {
    this.timerWorker = undefined;
    this.running = false;
    this.timer = TIMER_DURATION;
    this.handler = undefined;
  }

  draw(ctx, camContext) {
    ctx.beginPath();
    ctx.fillStyle = 'black';
    const x = camContext.viewportWidth / 2 - (BOARD_SIZE / 2) + BOARD_SIZE + 25;
    const y = (camContext.viewportHeight / 2 - (BOARD_SIZE / 2));
    ctx.rect(x, y, 100, 50);
    ctx.fill();

    ctx.beginPath();
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(this.timer, x + 40, y + 35);
  }

  reset() {
    this.timer = TIMER_DURATION;
  }

  start(handler) {
    if (!this.running) {
      this.handler = handler;
      this.timerWorker = setInterval(this.timerCount.bind(this), 1000);
      this.running = true;
    }
  }

  stop() {
    this.timer = 0;
    clearInterval(this.timerWorker);
    this.running = false;
  }

  getTime() {
    return this.timer;
  }

  timerCount() {
    this.timer -= 1;
    if (this.timer === 0) {
      this.stop();
      if (this.handler !== undefined) {
        this.handler();
        this.handler = undefined;
      }
    }
  }
}

class DrawSomethingScore {
  constructor() {
    this.score = 0;
  }

  draw(ctx, camContext) {
    ctx.beginPath();
    ctx.fillStyle = 'black';
    const x = camContext.viewportWidth / 2 - (BOARD_SIZE / 2) + BOARD_SIZE + 25;
    const y = (camContext.viewportHeight / 2 - (BOARD_SIZE / 2)) + 75;
    ctx.rect(x, y, 200, 50);
    ctx.fill();

    ctx.beginPath();
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`Score: ${this.score}`, x + 40, y + 35);
  }

  increase() {
    this.score += 1;
  }
}

export {
  DrawSomethingWhiteboard,
  DrawSomethingInputBox,
  DrawSomethingPrompt,
  DrawSomethingTimer,
  DrawSomethingScore,
};
