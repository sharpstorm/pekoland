import { createElement } from './ui-utils.js';
import UIElement, { UIAnchor } from './ui-element.js';

class GameMenu extends UIElement {
  constructor(gameList) {
    super('30%', '30%', '40%', '40%', new UIAnchor(true, true, true, true)); // Center
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
        createElement('div', { eventListener: { click: () => this.emitEvent('gamePressed', game.gameName) } }, game.gameName),
      );
    });

    this.gameMenu = createElement('div', { id: 'game-menu' },
      this.titleWindow,
      this.gamesWindow,
      createElement('div', { id: 'game-menu-join' },
        createElement('div', { eventListener: { click: () => this.emitEvent('joinYes') } }, 'Yes'),
        createElement('div', { eventListener: { click: () => this.emitEvent('joinNo') } }, 'No')),
      createElement('div', { id: 'game-menu-spectate' },
        createElement('div', { eventListener: { click: () => this.emitEvent('spectateYes') } }, 'Yes'),
        createElement('div', { eventListener: { click: () => this.emitEvent('spectateNo') } }, 'No')),
      createElement('div', { id: 'game-menu-waiting' }),
      createElement('div', { id: 'game-menu-title-closebtn', eventListener: { click: () => this.close() } }));

    this.node.appendChild(this.gameMenu);
    this.node.style.display = 'none';
  }

  // eslint-disable-next-line class-methods-use-this
  createCard(text) {
    const card = createElement('div', { className: 'game-menu-cards' });
    card.innerHTML = text;
    return card;
  }

  close() {
    this.node.style.display = 'none';
    this.emitEvent('close');
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
  // SHOW PLAYER TURN HERE? OR IN GAME
  constructor() {
    super('80%', '10%', '15%', '80%', new UIAnchor(false, false, false, false)); // Center
    this.initObject();
  }

  initObject() {
    this.node.id = 'game-overlay';
    this.gameOverlayWindow = createElement('div', { id: 'game-overlay-window' });
    this.turnCounter = createElement('div', { id: 'game-overlay-window-turn' });
    this.leaveBtn = createElement('div', { id: 'game-overlay-window-leave' });
    this.leaveBtn.innerHTML = '<Pre> Leave Game';
    this.turnCounter.innerHTML = 'Your Move';
    this.gameOverlayWindow.appendChild(this.turnCounter);
    this.gameOverlayWindow.appendChild(this.leaveBtn);
    this.node.appendChild(this.gameOverlayWindow);
    this.gameOverlayWindow.style.display = 'none';
  }

  show() {
    this.gameOverlayWindow.style.display = 'block';
  }

  close() {
    this.gameOverlayWindow.style.display = 'none';
  }
}

export { GameMenu as default, GameOverlay };
