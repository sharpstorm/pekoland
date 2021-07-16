import { createElement } from './ui-utils.js';
import UIElement, { UIAnchor } from './ui-element.js';
import Button, { LongButton } from './ui-button.js';
import SpriteManager from '../managers/sprite-manager.js';

class GameMenu extends UIElement {
  constructor(gameList) {
    super(0, 0, 600, 400, new UIAnchor(true, true, true, true)); // Center
    this.cardList = [];
    this.gameNameList = [];
    this.initObject(gameList);

    this.eventListeners = {};
  }

  initObject(gameList) {
    this.titleWindow = createElement('div', { id: 'game-menu-title' });
    this.gamesWindow = createElement('div', { id: 'game-menu-games' });

    gameList.forEach((game) => {
      this.gameNameList.push(game.gameName);
      this.gamesWindow.appendChild(
        createElement('div', { eventListener: { click: (evt) => evt.stopPropagation() || this.emitEvent('gamePressed', game.gameName) } }, game.gameName),
      );
    });
    const closeBtn = new Button(10, 10, 36, 36, new UIAnchor(true, true, false, false),
      SpriteManager.getInstance().getSprite('icon-cross'));
    closeBtn.addEventListener('click', (evt) => {
      evt.stopPropagation();
      this.emitEvent('close');
      this.close();
    });

    this.gameMenu = createElement('div', { id: 'game-menu' },
      this.titleWindow,
      this.gamesWindow,
      createElement('div', { id: 'game-menu-join' },
        createElement('div', { eventListener: { click: (evt) => evt.stopPropagation() || this.emitEvent('joinYes') }, style: { borderRight: '1px solid #772108' } }, 'Yes'),
        createElement('div', { eventListener: { click: (evt) => evt.stopPropagation() || this.emitEvent('joinNo') } }, 'No')),
      createElement('div', { id: 'game-menu-spectate' },
        createElement('div', { eventListener: { click: (evt) => evt.stopPropagation() || this.emitEvent('spectateYes') }, style: { borderRight: '1px solid #772108' } }, 'Yes'),
        createElement('div', { eventListener: { click: (evt) => evt.stopPropagation() || this.emitEvent('spectateNo') } }, 'No')),
      createElement('div', { id: 'game-menu-waiting' }),
      closeBtn.node);

    const panelBack = super.drawImage((ctx) => {
      SpriteManager.getInstance().getSprite('panel').drawAt(ctx, 0, 0, this.width, this.height);
    });
    this.gameMenu.style.background = panelBack;

    this.node.appendChild(this.gameMenu);
    this.node.style.display = 'none';
  }

  close() {
    this.node.style.display = 'none';
  }

  emitEvent(evtId, data) {
    if (evtId in this.eventListeners) {
      this.eventListeners[evtId](data);
    }
  }

  on(evtId, handler) {
    this.eventListeners[evtId] = handler;
  }

  displayWindow(page) {
    switch (page) {
      case 0: // Games Window
        this.titleWindow.textContent = 'Games';
        this.gameMenu.className = 'games';
        break;
      case 1: // Join Window
        this.titleWindow.textContent = 'Join Game?';
        this.gameMenu.className = 'join';
        break;
      case 2: // Spectate Window
        this.titleWindow.textContent = 'Spectate Game?';
        this.gameMenu.className = 'spectate';
        break;
      case 3: // Waiting Window
        this.titleWindow.textContent = 'Waiting for someone to join';
        this.gameMenu.className = 'waiting';
        break;
      default:
    }
    this.node.style.display = '';
  }
}

class GameOverlay extends UIElement {
  constructor() {
    super(0, 20, 200, 50, new UIAnchor(true, true, false, true)); // Center
    this.initObject();
    this.leaveListener = undefined;
  }

  initObject() {
    this.node.id = 'game-overlay';
    this.leaveBtn = new LongButton(0, 0, 120, 36, new UIAnchor(true, true, false, true), 'Leave Game');
    this.leaveBtn.addEventListener('click', (evt) => {
      evt.stopPropagation();
      if (this.leaveListener !== undefined) {
        this.leaveListener();
      }
    });
    this.gameOverlayWindow = createElement('div', { id: 'game-overlay-window' }, this.leaveBtn.node);
    this.node.appendChild(this.gameOverlayWindow);
    this.close();
  }

  show() {
    this.gameOverlayWindow.style.display = 'block';
  }

  close() {
    this.gameOverlayWindow.style.display = 'none';
  }

  registerLeaveListener(leaveListener) {
    this.leaveListener = leaveListener;
  }
}

export { GameMenu as default, GameOverlay };
