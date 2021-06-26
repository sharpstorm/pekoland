import UIElement, { UIAnchor } from './ui-element.js';
import { createElement } from './ui-utils.js';
import SpriteManager from '../managers/sprite-manager.js';
import Button from './ui-button.js';

export default class AdmissionPrompt extends UIElement {
  constructor() {
    super(0, 300, 200, 100, new UIAnchor(false, true, true, false)); // Bottom Right
    this.initObject();

    this.lastState = undefined;
    this.submitListeners = [];
    this.historyObjects = [];
    this.acceptHandler = undefined;
    this.rejectHandler = undefined;
    this.waitingQueue = [];
    this.showing = false;
  }

  initObject() {
    this.node.id = 'admit-prompt';
    this.panelContainer = createElement('div', { style: { position: 'relative', width: '100%', height: '100%' } });
    const panelBack = this.drawImage((ctx) => {
      SpriteManager.getInstance().getSprite('panel').drawAt(ctx, 0, 0, 220, 100);
    });
    this.panelContainer.style.background = panelBack;

    this.textArea = createElement('div', {
      style: {
        position: 'absolute',
        top: '10px',
        left: '10px',
        width: this.width - 20,
        height: this.height - 50,
        overflow: 'hidden',
        textAlign: 'center',
        color: '#000',
        fontSize: '1.1rem',
      },
    });
    this.textArea.textContent = 'Sharpie is requesting to join!';
    this.panelContainer.appendChild(this.textArea);

    this.acceptButton = new Button(-40, 8, 36, 36, new UIAnchor(false, true, true, true),
      SpriteManager.getInstance().getSprite('icon-tick'));
    this.rejectButton = new Button(40, 8, 36, 36, new UIAnchor(false, true, true, true),
      SpriteManager.getInstance().getSprite('icon-cross'));

    this.panelContainer.appendChild(this.acceptButton.node);
    this.panelContainer.appendChild(this.rejectButton.node);

    this.acceptButton.addEventListener('click', (evt) => {
      evt.stopPropagation();
      if (this.acceptHandler !== undefined) {
        this.acceptHandler();
      }
      this.resetState();
    });

    this.rejectButton.addEventListener('click', (evt) => {
      evt.stopPropagation();
      if (this.rejectHandler !== undefined) {
        this.rejectHandler();
      }
      this.resetState();
    });
    this.node.appendChild(this.panelContainer);
  }

  resetState() {
    this.acceptHandler = undefined;
    this.rejectHandler = undefined;
    this.textArea.textContent = '';
    this.node.classList.remove('show');
    this.showing = false;

    if (this.waitingQueue.length > 0) {
      // Something in waiting queue
      const nextItem = this.waitingQueue[0];
      this.waitingQueue.splice(0, 1);
      this.prompt(nextItem.text, nextItem.accept, nextItem.reject);
    }
  }

  prompt(text, accept, reject) {
    if (!this.showing) {
      this.textArea.textContent = text;
      this.acceptHandler = accept;
      this.rejectHandler = reject;
      this.node.classList.add('show');
      this.showing = true;
    } else {
      this.waitingQueue.push({ text, accept, reject });
    }
  }

  drawImage(drawFunc) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const { width, height } = this;
    canvas.width = width;
    canvas.height = height;

    drawFunc(ctx);
    return `url('${canvas.toDataURL()}')`;
  }
}
