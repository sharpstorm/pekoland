import { createElement } from './ui-utils.js';
import UIElement, { UIAnchor } from './ui-element.js';
import GameManager from '../managers/game-manager.js';

class GameMenu extends UIElement {
  constructor(gameList) {
    super('30%', '30%', '40%', '40%', new UIAnchor(false, false, false, false)); // Center
    this.cardList = [];
    this.gameNameList = [];
    this.initObject(gameList);
  }

  initObject(gameList) {
    this.node.id = 'gameMenu';
    this.gameMenu = createElement('div', { id: 'game-menu' });
    this.titleWindow = createElement('div', { id: 'game-menu-title' });
    this.gamesWindow = createElement('div', { id: 'game-menu-games' });
    this.joinWindow = createElement('div', { id: 'game-menu-join' });
    this.waitingWindow = createElement('div', { id: 'game-menu-waiting' });
    this.spectateWindow = createElement('div', { id: 'game-menu-spectate' });
    this.closeBtn = createElement('div', { id: 'game-menu-title-closebtn' });
    this.node.appendChild(this.gameMenu);
    this.gameMenu.appendChild(this.titleWindow);
    this.gameMenu.appendChild(this.gamesWindow);
    this.gameMenu.appendChild(this.joinWindow);
    this.gameMenu.appendChild(this.spectateWindow);
    this.gameMenu.appendChild(this.waitingWindow);
    this.gameMenu.appendChild(this.closeBtn);
    gameList.forEach((game) => {
      this.gameNameList.push(game.gameName);
      this.gamesWindow.appendChild(this.createCard(game.gameName));
    });
    this.joinWindow.appendChild(this.createCard('Yes')); // JoinWindow - Child Node[0]
    this.joinWindow.appendChild(this.createCard('No')); // JoinWindow - Child Node[1]
    this.spectateWindow.appendChild(this.createCard('Yes')); // spectateWidnow - Child Node[0]
    this.spectateWindow.appendChild(this.createCard('No')); // spectateWidnow - Child Node[1]
    this.closeBtn.addEventListener('click', () => {
      GameManager.getInstance().getBoardGameManager().closeGameMenu();
      GameManager.getInstance().getBoardGameManager().gameState = undefined;
      this.close();
    });
    this.close();
  }

  // eslint-disable-next-line class-methods-use-this
  createCard(text) {
    const card = createElement('div', { className: 'game-menu-cards' });
    card.innerHTML = text;
    return card;
  }

  close() {
    this.gameMenu.style.display = 'none';
  }

  displayWindow(page) {
    switch (page) {
      case 0: // Games Window
        this.titleWindow.innerHTML = '<Pre> Games';
        this.gameMenu.style.display = 'block';
        this.joinWindow.style.display = 'none';
        this.gamesWindow.style.display = 'block';
        this.spectateWindow.style.display = 'none';
        this.waitingWindow.style.display = 'none';
        break;
      case 1: // Join Window
        this.titleWindow.innerHTML = '<Pre> Join Game?';
        this.gameMenu.style.display = 'block';
        this.joinWindow.style.display = 'block';
        this.gamesWindow.style.display = 'none';
        this.spectateWindow.style.display = 'none';
        this.waitingWindow.style.display = 'none';
        break;
      case 2: // Spectate Window
        this.titleWindow.innerHTML = '<Pre> Spectate Game?';
        this.gameMenu.style.display = 'block';
        this.joinWindow.style.display = 'none';
        this.gamesWindow.style.display = 'none';
        this.spectateWindow.style.display = 'block';
        this.waitingWindow.style.display = 'none';
        break;
      case 3: // Waiting Window
        this.titleWindow.innerHTML = '<Pre> Waiting for someone to join';
        this.gameMenu.style.display = 'block';
        this.joinWindow.style.display = 'none';
        this.gamesWindow.style.display = 'none';
        this.spectateWindow.style.display = 'none';
        this.waitingWindow.style.display = 'block';
        break;
      default:
    }
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
