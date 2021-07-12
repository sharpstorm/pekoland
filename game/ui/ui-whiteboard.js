import UIElement, { UIAnchor } from './ui-element.js';
import { createElement } from './ui-utils.js';
import SpriteManager from '../managers/sprite-manager.js';
import Button, { LongButton } from './ui-button.js';

const COLORS = [
  '#FFF',
  '#000',
  '#F00',
  '#0F0',
  '#00F',
  '#FF0',
  '#0FF',
  '#F0F',
];
const BRUSHES = [4, 8, 12, 16, 20];
const SIZE = 484;

export default class Whiteboard extends UIElement {
  constructor() {
    super(0, 0, 800, 500, new UIAnchor(true, true, true, true));

    this.selectedColor = 0;
    this.selectedBrush = 0;
    this.drawing = false;
    this.fromPt = undefined;
    this.lastState = undefined;
    this.showing = false;

    this.updateTimer = undefined;
    this.closeListener = undefined;
    this.updateListener = undefined;
    this.updateList = [];

    this.initObject();
  }

  initObject() {
    this.colorTiles = COLORS.map((x, idx) => createElement('div', {
      style: { backgroundColor: x },
      eventListener: {
        click: () => { this.selectedColor = idx; this.refreshSelected(); },
      },
    }));
    this.brushTiles = BRUSHES.map((x, idx) => createElement('div', {
      eventListener: {
        click: () => { this.selectedBrush = idx; this.refreshSelected(); },
      },
    }, createElement('div', { style: { width: x, height: x } })));

    this.drawingCanvas = createElement('canvas', {});
    this.drawingCanvas.width = SIZE;
    this.drawingCanvas.height = SIZE;
    this.drawingContext = this.drawingCanvas.getContext('2d');
    this.drawingContext.lineCap = 'round';
    this.attachCanvasListeners();

    const clearBtn = new LongButton(0, 0, 200, 36, new UIAnchor(false, true, false, true), 'Clear Board');
    clearBtn.addEventListener('click', () => {
      this.drawingContext.clearRect(0, 0, SIZE, SIZE);
      this.updateList.push({
        clear: true,
        done: true,
      });
      if (this.updateTimer === undefined) {
        this.triggerUpdateEvent();
      }
    });

    this.panelContainer = createElement('div', {
      style: {
        position: 'relative',
        width: '100%',
        height: '100%',
      },
      id: 'whiteboard',
    },
    this.drawingCanvas,
    createElement('div', {},
      createElement('div', {}, 'Drawing Tools'),
      createElement('div', { className: 'whiteboard-colors' }, ...this.colorTiles),
      createElement('div', { className: 'whiteboard-brushes' }, ...this.brushTiles),
      createElement('div', { style: { position: 'relative', marginTop: '16px' } }, clearBtn.node)));

    const panelBack = super.drawImage((ctx) => {
      SpriteManager.getInstance().getSprite('panel').drawAt(ctx, 0, 0, 800, 500);
    });
    this.panelContainer.style.background = panelBack;
    this.node.appendChild(this.panelContainer);

    const closeBtn = new Button(10, 10, 36, 36, new UIAnchor(true, true, false, false),
      SpriteManager.getInstance().getSprite('icon-cross'));
    closeBtn.addEventListener('click', (evt) => {
      evt.stopPropagation();
      this.close();
    });
    this.node.appendChild(closeBtn.node);

    this.refreshSelected();
    this.node.style.display = 'none';
  }

  attachCanvasListeners() {
    const canvas = this.drawingCanvas;
    canvas.addEventListener('mousedown', (evt) => {
      this.drawing = true;
      // Coordinates are a 1:1 map
      this.fromPt = {
        x: evt.offsetX,
        y: evt.offsetY,
      };
      this.drawingContext.strokeStyle = COLORS[this.selectedColor];
      this.drawingContext.lineWidth = BRUSHES[this.selectedBrush];
      this.updateList.push({
        brush: this.selectedBrush,
        color: this.selectedColor,
        path: [],
        done: false,
      });
      requestAnimationFrame(this.refreshCanvas.bind(this));
    });

    canvas.addEventListener('mouseup', () => {
      this.drawing = false;
      this.fromPt = undefined;
      this.toPt = undefined;
      if (this.updateList.length > 0) {
        this.updateList[this.updateList.length - 1].done = true;
      }
    });

    canvas.addEventListener('mousemove', (evt) => {
      if (!this.drawing) return;

      this.toPt = {
        x: evt.offsetX,
        y: evt.offsetY,
      };
    });
  }

  refreshCanvas() {
    if (!this.drawing) return;

    const from = this.fromPt;
    const to = this.toPt;
    if (from === undefined || to === undefined) {
      // Skip Frame
      requestAnimationFrame(this.refreshCanvas.bind(this));
      return;
    }

    const ctx = this.drawingContext;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    if (this.updateList.length > 0) {
      this.updateList[this.updateList.length - 1].path.push({ from, to });
    }
    this.fromPt = to;
    this.toPt = undefined;

    if (this.updateTimer === undefined) {
      this.triggerUpdateEvent();
    }

    requestAnimationFrame(this.refreshCanvas.bind(this));
  }

  refreshSelected() {
    this.colorTiles.forEach((x) => x.classList.remove('selected'));
    this.brushTiles.forEach((x) => x.classList.remove('selected'));

    this.colorTiles[this.selectedColor].classList.add('selected');
    this.brushTiles[this.selectedBrush].classList.add('selected');
  }

  setCanvasState(data) {
    const image = new Image();
    image.onload = () => {
      this.drawingContext.drawImage(image, 0, 0, SIZE, SIZE);
    };
    image.src = data;
  }

  deltaCanvasUpdate(data) {
    data.forEach((item) => {
      const ctx = this.drawingContext;
      if (item.clear) {
        ctx.clearRect(0, 0, SIZE, SIZE);
        return;
      }

      const oldStroke = ctx.strokeStyle;
      const oldLine = ctx.lineWidth;

      ctx.strokeStyle = COLORS[item.color];
      ctx.lineWidth = BRUSHES[item.brush];

      ctx.beginPath();
      item.path.forEach(({ from, to }) => {
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      });
      ctx.strokeStyle = oldStroke;
      ctx.lineWidth = oldLine;
    });
  }

  triggerUpdateEvent() {
    if (this.updateListener === undefined) {
      this.updateTimer = undefined;
      return;
    }

    const state = this.drawingCanvas.toDataURL('image/png');
    const delta = this.updateList;
    this.updateListener(state, delta);

    if (this.updateList.length > 1) {
      this.updateList = this.updateList.slice(-1);
    }
    if (this.updateList.length > 0) {
      if (this.updateList[this.updateList.length - 1].done) {
        this.updateList = [];
      }
    }

    if (this.drawing) {
      this.updateTimer = setTimeout(this.triggerUpdateEvent.bind(this), 500);
    } else {
      this.updateTimer = undefined;
    }
  }

  setUpdateListener(listener) {
    this.updateListener = listener;
  }

  setCloseListener(listener) {
    this.closeListener = listener;
  }

  close() {
    if (this.showing) {
      this.node.style.display = 'none';
      this.showing = false;
      if (this.closeListener) {
        this.closeListener();
        this.closeListener = undefined;
        this.updateListener = undefined;
      }
    }
  }

  show() {
    if (!this.showing) {
      this.node.style.display = '';
      this.showing = true;
    }
  }
}
