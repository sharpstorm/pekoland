import { createElement } from './ui-utils.js';
import UIElement, { UIAnchor } from './ui-element.js';
import GameManager from '../managers/game-manager.js';

class GameMenu extends UIElement {
  constructor(gameList) {
    super('30%', '30%', '40%', '40%', new UIAnchor(false, false, false, false)); // Center
    this.cardList = [];
    this.gameNameList = [];
    this.options = [];
    this.initObject(gameList);
  }

  initObject(gameList) {
    this.node.id = 'gameMenu';
    this.gameMenuWindow = createElement('div', { id: 'game-menu-window' });
    this.titleWindow = createElement('div', { id: 'game-menu-window-title' });
    this.gamesHolder = createElement('div', { id: 'game-menu-window-games-holder' });
    this.titleText = createElement('div', { id: 'game-menu-window-title-text' });
    this.closeBtn = createElement('div', { id: 'game-menu-window-close-btn' });
    this.closeBtn.addEventListener('click', () => {
      GameManager.getInstance().getBoardGameManager().closeMenu();
      this.close();
    });

    // this.closeBtn.innerHTML = 'X';
    this.titleWindow.appendChild(this.closeBtn);
    this.titleText.innerHTML = 'Games';
    this.gameMenuWindow.style.display = 'none';
    this.gameMenuWindow.appendChild(this.titleWindow);
    gameList.forEach((game) => {
      const card = createElement('div', { className: 'game-menu-window-games' });
      card.innerHTML = game.gameName;
      this.cardList.push(card);
      this.gameNameList.push(game.gameName);
      this.gamesHolder.appendChild(card);
    });
    // this.gamesHolder.appendChild(createElement('div', { className: 'game-menu-window-games' }));
    this.yesNoScreen = createElement('div', { id: 'game-menu-window-yes-no' });
    this.yesNoScreen.style.display = 'none';
    this.gameMenuWindow.appendChild(this.yesNoScreen);

    let card = createElement('div', { className: 'game-menu-window-games', id: 'gameJoinYes' });
    card.innerHTML = 'Yes';
    this.yesNoScreen.appendChild(card);
    this.options.push(card);

    card = createElement('div', { className: 'game-menu-window-games', id: 'gameJoinNo' });
    card.innerHTML = 'No';
    this.yesNoScreen.appendChild(card);
    this.options.push(card);

    this.gameMenuWindow.appendChild(this.gamesHolder);
    this.titleWindow.appendChild(this.titleText);
    this.node.appendChild(this.gameMenuWindow);
    // console.log(this.gameList);
  }

  toggle() {
    if (this.gameMenuWindow.style.display === 'none') {
      this.titleText.innerHTML = 'Games';
      // eslint-disable-next-line no-param-reassign
      // this.gamesHolder.childNodes.forEach((cn) => { cn.style.display = 'block'; });
      this.gamesHolder.style.display = 'block';
      this.gamesHolder.style.backgroundImage = '';
      this.gameMenuWindow.style.display = 'block';
    } else {
      this.gameMenuWindow.style.display = 'none';
    }
  }

  showJoinGame() {
    this.titleText.innerHTML = 'Join Game?';
    this.gameMenuWindow.style.display = 'block';
    this.gamesHolder.style.display = 'none';
    // eslint-disable-next-line no-param-reassign
    this.gamesHolder.childNodes.forEach((cn) => { cn.style.display = 'none'; });
    this.yesNoScreen.style.display = 'block';
  }

  close() {
    this.gameMenuWindow.style.display = 'none';
  }

  showGameMenu() {
    this.titleText.innerHTML = 'Games';
    // eslint-disable-next-line no-param-reassign
    this.gamesHolder.childNodes.forEach((cn) => { cn.style.display = 'block'; });
    this.gamesHolder.style.backgroundImage = '';
    this.gamesHolder.style.display = 'block';
    this.gameMenuWindow.style.display = 'block';
  }

  waiting() {
    // eslint-disable-next-line no-param-reassign
    this.gamesHolder.childNodes.forEach((cn) => { cn.style.display = 'none'; });
    this.titleText.innerHTML = 'Waiting for someone to join';
    this.gamesHolder.style.backgroundImage = 'url(../Images/waiting.gif)';
    this.gamesHolder.style.backgroundRepeat = 'no-repeat';
    this.gamesHolder.style.backgroundPosition = 'center';
    this.gamesHolder.style.backgroundSize = 'contain';
  }
}

export { GameMenu as default };
