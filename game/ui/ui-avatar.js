import { createElement } from './ui-utils.js';
import UIElement, { UIAnchor } from './ui-element.js';
import Button, { LongButton } from './ui-button.js';
import SpriteManager from '../managers/sprite-manager.js';

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
    this.titleWindow = createElement('div', { id: 'game-menu-title' }, 'Choose Your Avatar');
    const leftBtn = new Button(50, 0, 36, 36, new UIAnchor(true, false, true, true), '<');
    const rightBtn = new Button(50, 0, 36, 36, new UIAnchor(true, true, true, false), '>');
    const confirmBtn = new LongButton(0, 10, 100, 36, new UIAnchor(false, true, true, true), 'Confirm');
    const closeBtn = new Button(10, 10, 36, 36, new UIAnchor(true, true, false, false), SpriteManager.getInstance().getSprite('icon-cross'));

    this.avatarWindow = createElement('div', {
      id: 'avatar-window',
      style: {
        color: 'black',
      },
    });

    this.avatarMenu = createElement('div', {
      id: 'avatar-menu',
      style: {
        color: 'black',
      },
    },
    leftBtn.node,
    rightBtn.node,
    confirmBtn.node,
    closeBtn.node,
    this.titleWindow,
    this.avatarWindow);

    this.node.addEventListener('click', (evt) => evt.stopPropagation());
    rightBtn.addEventListener('click', () => {
      this.currentIndex += 1;
      if (this.currentIndex === this.avatarArr.length) {
        this.currentIndex = 0;
      }
      this.refreshAvatarWindow();
    });

    leftBtn.addEventListener('click', () => {
      this.currentIndex -= 1;
      if (this.currentIndex === -1) {
        this.currentIndex = this.avatarArr.length - 1;
      }
      this.refreshAvatarWindow();
    });

    confirmBtn.addEventListener('click', () => {
      this.node.style.display = 'none';
      this.emitEvent('changeAvatar', this.avatarArr[this.currentIndex]);
    });

    closeBtn.addEventListener('click', () => { this.close(); });

    this.node.appendChild(this.avatarMenu);

    const panelBack = super.drawImage((ctx) => {
      SpriteManager.getInstance().getSprite('panel').drawAt(ctx, 0, 0, this.width, this.height);
    });

    this.avatarMenu.style.background = panelBack;
    this.node.style.display = 'none';
  }

  show() {
    this.refreshAvatarWindow();
    this.node.style.display = 'block';
  }

  refreshAvatarWindow() {
    this.currentA = super.drawImage((ctx) => {
      const width = SpriteManager.getInstance().getSprite(this.avatarArr[this.currentIndex])
        .getSpriteByDirection(2).getSpriteAtFrame(1).width * 2;
      const height = SpriteManager.getInstance().getSprite(this.avatarArr[this.currentIndex])
        .getSpriteByDirection(2).getSpriteAtFrame(1).height * 2;
      SpriteManager.getInstance().getSprite(this.avatarArr[this.currentIndex])
        .getSpriteByDirection(2).getSpriteAtFrame(1)
        .drawAt(ctx, 0, 0, width, height);
    });
    this.avatarWindow.style.background = this.currentA;
  }

  emitEvent(evtId, data) {
    if (evtId in this.eventListeners) {
      this.eventListeners[evtId](data);
    }
  }

  close() {
    this.node.style.display = 'none';
  }

  on(evtId, handler) {
    this.eventListeners[evtId] = handler;
  }
}

export { AvatarMenu as default };
