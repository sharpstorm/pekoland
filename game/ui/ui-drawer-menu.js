import UIElement, { UIAnchor } from './ui-element.js';
import { createElement } from './ui-utils.js';
import SpriteManager from '../managers/sprite-manager.js';
import { LongButton } from './ui-button.js';

export default class DrawerMenu extends UIElement {
  constructor(furnitureBtnEnabled) {
    super(0, 50, 200, 200, new UIAnchor(false, true, true, false)); // Bottom Right
    this.initObject(furnitureBtnEnabled);

    this.showing = false;
    this.quitHandler = undefined;
    this.furnitureHandler = undefined;
    this.avatarHandler = undefined;
  }

  initObject(furnitureBtnEnabled) {
    this.node.id = 'drawer-menu';
    this.node.style.overflow = 'hidden';
    this.panelContainer = createElement('div', {
      style: {
        position: 'relative',
        width: '100%',
        height: '100%',
      },
    });
    const panelBack = super.drawImage((ctx) => {
      SpriteManager.getInstance().getSprite('panel').drawAt(ctx, 0, 0, 200, 200);
    });
    this.panelContainer.style.background = panelBack;

    const quitBtn = new LongButton(0, 12, 180, 36, new UIAnchor(false, true, true, true), 'Leave Game');
    quitBtn.addEventListener('click', (evt) => {
      evt.stopPropagation();
      if (this.quitHandler !== undefined) this.quitHandler();
    });
    this.panelContainer.appendChild(quitBtn.node);

    const avatarBtn = new LongButton(0, 54, 180, 36, new UIAnchor(false, true, true, true), 'Change Avatar');
    avatarBtn.addEventListener('click', (evt) => {
      evt.stopPropagation();
      if (this.avatarHandler !== undefined) {
        this.avatarHandler();
      }
    });

    if (furnitureBtnEnabled) {
      const furnitureBtn = new LongButton(0, 96, 180, 36, new UIAnchor(false, true, true, true), 'Customize World');
      furnitureBtn.addEventListener('click', (evt) => {
        evt.stopPropagation();
        if (this.furnitureHandler !== undefined) this.furnitureHandler();
      });
      this.panelContainer.appendChild(furnitureBtn.node);
    }

    this.panelContainer.appendChild(avatarBtn.node);

    this.node.appendChild(this.panelContainer);
  }

  setAvatarHandler(handler) {
    this.avatarHandler = handler;
  }

  setQuitHandler(handler) {
    this.quitHandler = handler;
  }

  setCustomizeWorldHandler(handler) {
    this.furnitureHandler = handler;
  }

  setVisible(show) {
    if (show && !this.showing) {
      this.panelContainer.classList.add('show');
      this.showing = true;
    } else if (!show && this.showing) {
      this.panelContainer.classList.remove('show');
      this.showing = false;
    }
  }

  toggleVisible() {
    if (this.showing) {
      this.setVisible(false);
    } else {
      this.setVisible(true);
    }
  }
}
