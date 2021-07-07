import UIElement, { UIAnchor } from './ui-element.js';
import { createElement } from './ui-utils.js';
import SpriteManager from '../managers/sprite-manager.js';

export default class CustomizeWorldMenu extends UIElement {
  constructor() {
    super(0, 50, 400, 200, new UIAnchor(true, true, false, true)); // Bottom Right
    this.initObject();

    this.showing = false;
    this.furnitures = [];
  }

  initObject() {
    this.node.id = 'customize-world-menu';
    this.node.style.overflow = 'hidden';
    this.panelContainer = createElement('div', {
      style: {
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      },
    },
    createElement('div', { style: { margin: '8px auto', textAlign: 'center', color: '#000' } }, 'Select a Furniture'));
    const panelBack = super.drawImage((ctx) => {
      SpriteManager.getInstance().getSprite('panel').drawAt(ctx, 0, 0, 400, 200);
    });
    this.panelContainer.style.background = panelBack;
    this.node.appendChild(this.panelContainer);

    this.furnitureList = createElement('div', {
      id: 'furniture-list',
      style: {
        display: 'flex',
        overflowX: 'scroll',
        flex: '1 1 0',
        margin: '4px 8px 8px',
      },
    });
    this.panelContainer.appendChild(this.furnitureList);
  }

  addFurniture(furniture) {
    this.furnitures.push(furniture);
    const sprite = super.drawImage((ctx) => {
      furniture.sprite.drawAt(ctx, 0, 0, 100, 100);
    });

    const node = createElement('div', {
      style: {
        width: '100px',
        height: '100px',
      },
    });
    node.style.background = sprite;

    const container = createElement('div', {}, node);
    if (this.furnitures.length === 1) {
      container.classList.add('selected');
    }

    this.furnitureList.appendChild(container);
  }

  setVisible(show) {
    if (show && !this.showing) {
      this.node.classList.add('show');
      this.showing = true;
    } else if (!show && this.showing) {
      this.node.classList.remove('show');
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
