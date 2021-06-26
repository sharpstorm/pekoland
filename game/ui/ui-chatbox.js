import UIElement, { UIAnchor } from './ui-element.js';
import GameManager from '../managers/game-manager.js';
import { createElement } from './ui-utils.js';

const chatManager = GameManager.getInstance().getTextChannelManager();

export default class Chatbox extends UIElement {
  constructor() {
    super(0, 0, 500, 170, new UIAnchor(false, false, true, true)); // Bottom Left
    this.initObject();

    this.lastState = undefined;
    this.submitListeners = [];
    this.historyObjects = [];
  }

  initObject() {
    this.node.id = 'chatbox';
    this.inputBox = createElement('input', { id: 'chatbox-input', type: 'text' });
    this.historyBox = createElement('div', { id: 'chatbox-history' });

    this.node.appendChild(this.historyBox);
    this.node.appendChild(
      createElement('div', { id: 'chatbox-input-row' },
        this.inputBox,
        createElement('button', { id: 'chatbox-btn-send', eventListener: { click: this.triggerListeners.bind(this) } }, 'Send')),
    );

    this.inputBox.addEventListener('keydown', (evt) => {
      evt.stopPropagation();
      if (evt.keyCode === 13) {
        this.triggerListeners();
      }
    });
  }

  addSubmitListener(listener) {
    this.submitListeners.push(listener);
  }

  triggerListeners() {
    const text = this.inputBox.value;
    if (text !== '') {
      this.submitListeners.forEach((x) => x(text));
      this.inputBox.value = '';
    }
  }

  update() {
    if (chatManager.getHistory().length !== this.historyObjects.length) {
      for (let i = this.historyObjects.length; i < chatManager.getHistory().length; i += 1) {
        const line = createElement('div', {}, chatManager.getHistory()[i]);
        this.historyObjects.push(line);
        this.historyBox.appendChild(line);
        this.historyBox.scrollTo(0, this.historyBox.scrollHeight);
      }
    }
  }
}
