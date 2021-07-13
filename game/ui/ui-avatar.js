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

    this.eventListeners = {};
  }

  initObject() {
    this.titleWindow = createElement('div', { id: 'game-menu-title' });
    this.avatarMenu = createElement('div', { id: 'avatar-menu' });
    this.avatarWindow = createElement('div', { id: 'avatar-window' });

    const leftBtn = new Button(10, 10, 36, 36, new UIAnchor(false, false, false, true),
      '<');
    const rightBtn = new Button(10, 10, 36, 36, new UIAnchor(false, true, false, false),
      '>');
    const confirmBtn = new LongButton(10, 10, 100, 36, new UIAnchor(false, false, true, false), 'Confirm');

    this.titleWindow.style.color = 'black';
    this.avatarWindow.style.color = 'black';
    rightBtn.node.style.marginTop = '200px';
    leftBtn.node.style.marginTop = '200px';
    rightBtn.node.style.marginRight = '50px';
    leftBtn.node.style.marginLeft = '50px';
    confirmBtn.node.style.marginLeft = 'calc(50% - 50px)';

    this.node.addEventListener('click', (evt) => evt.stopPropagation());

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
    });

    confirmBtn.addEventListener('click', () => {
      PlayerManager.getInstance().getSelf().playerSprite = SpriteManager.getInstance()
        .getSprite(this.avatarArr[this.currentIndex]);
      this.node.style.display = 'none';
      this.emitEvent('changeAvatar');
    });

    this.titleWindow.innerHTML = 'Choose Your Avatar';

    this.avatarMenu.appendChild(leftBtn.node);
    this.avatarMenu.appendChild(rightBtn.node);
    this.avatarMenu.appendChild(confirmBtn.node);
    this.avatarMenu.appendChild(this.titleWindow);
    this.node.appendChild(this.avatarMenu);
    this.avatarMenu.appendChild(this.avatarWindow);

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
    this.node.style.display = 'none';
  }

  show() {
    this.node.style.display = 'block';
  }

  emitEvent(evtId, data) {
    if (evtId in this.eventListeners) {
      this.eventListeners[evtId](data);
    }
  }

  on(evtId, handler) {
    this.eventListeners[evtId] = handler;
  }
}

export { AvatarMenu as default };
