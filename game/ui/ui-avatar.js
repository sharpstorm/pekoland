import { createElement } from './ui-utils.js';
import UIElement, { UIAnchor } from './ui-element.js';
import Button, { LongButton } from './ui-button.js';
import SpriteManager from '../managers/sprite-manager.js';
import PlayerManager from '../managers/player-manager.js';

class AvatarMenu extends UIElement {
  constructor(avatarArr) {
    super(0, 0, 600, 400, new UIAnchor(true, true, true, true));
    this.currentIndex = 0;
    this.avatarArr = avatarArr;
    this.initObject();
    this.currentA = undefined;
  }

  initObject() {
    this.titleWindow = createElement('div', { id: 'game-menu-title' });
    this.avatarMenu = createElement('div', { id: 'avatar-menu' });
    const leftBtn = new Button(10, 10, 36, 36, new UIAnchor(false, false, false, true),
      SpriteManager.getInstance().getSprite('icon-cross'));
    const rightBtn = new Button(10, 10, 36, 36, new UIAnchor(false, true, false, false),
      SpriteManager.getInstance().getSprite('icon-cross'));
    rightBtn.node.style.marginTop = '200px';
    leftBtn.node.style.marginTop = '200px';
    rightBtn.node.style.marginRight = '50px';
    leftBtn.node.style.marginLeft = '50px';
    this.avatarWindow = createElement('div', { id: 'avatar-window' });

    rightBtn.addEventListener('click', () => {
      this.currentIndex += 1;
      if (this.currentIndex === this.avatarArr.length) {
        this.currentIndex = 0;
      }
      this.currentA = super.drawImage((ctx) => {
        SpriteManager.getInstance().getSprite(this.avatarArr[this.currentIndex])
          .getSpriteByDirection(2).getSpriteAtFrame(1)
          .drawAt(ctx, 0, 0, 50, 50);
      });
      this.avatarWindow.style.background = this.currentA;
      console.log(this.currentIndex);
    });

    leftBtn.addEventListener('click', () => {
      this.currentIndex -= 1;
      if (this.currentIndex === -1) {
        this.currentIndex = this.avatarArr.length - 1;
      }
      this.currentA = super.drawImage((ctx) => {
        SpriteManager.getInstance().getSprite(this.avatarArr[this.currentIndex])
          .getSpriteByDirection(2).getSpriteAtFrame(1)
          .drawAt(ctx, 0, 0, 50, 50);
      });
      this.avatarWindow.style.background = this.currentA;
      console.log(this.currentIndex);
    });

    this.avatarWindow.addEventListener('click', () => {
      PlayerManager.getInstance().getSelf().playerSprite = SpriteManager.getInstance()
        .getSprite(this.avatarArr[this.currentIndex]);
      this.node.style.display = 'none';
    });

    this.titleWindow.innerHTML = 'Choose Your Avatar';

    this.titleWindow.style.color = 'black';
    this.avatarWindow.style.color = 'black';
    this.avatarMenu.appendChild(leftBtn.node);
    this.avatarMenu.appendChild(rightBtn.node);
    this.avatarMenu.appendChild(this.titleWindow);
    this.node.appendChild(this.avatarMenu);
    this.avatarMenu.appendChild(this.avatarWindow);
    console.log(this.avatarArr[this.currentIndex]);
    const panelBack = super.drawImage((ctx) => {
      SpriteManager.getInstance().getSprite('panel').drawAt(ctx, 0, 0, this.width, this.height);
    });
    this.currentA = super.drawImage((ctx) => {
      SpriteManager.getInstance().getSprite(this.avatarArr[this.currentIndex])
        .getSpriteByDirection(2).getSpriteAtFrame(1)
        .drawAt(ctx, 0, 0, 50, 50);
    });
    this.avatarMenu.style.background = panelBack;
    this.avatarWindow.style.background = this.currentA;

    console.log(this.avatarArr);
    this.node.style.display = 'none';
  }
}

export { AvatarMenu as default };
