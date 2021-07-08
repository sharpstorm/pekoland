import UIElement, { UIAnchor } from './ui-element.js';
import { createElement } from './ui-utils.js';
import SpriteManager from '../managers/sprite-manager.js';
import { LongButton } from './ui-button.js';

export default class CustomizeWorldMenu extends UIElement {
  constructor() {
    super(0, 50, 400, 250, new UIAnchor(true, true, false, true)); // Bottom Right

    this.showing = false;
    this.furnitures = [];
    this.selectedFurniture = undefined;
    this.saveHandler = undefined;
    this.initObject();
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
    createElement('div', { style: { margin: '8px auto', textAlign: 'center', color: '#000' } }, 'Click on a Grid to Place'));
    const panelBack = super.drawImage((ctx) => {
      SpriteManager.getInstance().getSprite('panel').drawAt(ctx, 0, 0, 400, 250);
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

    this.addFurniture({
      sprite: SpriteManager.getInstance().getSprite('icon-cross'),
      id: undefined,
      name: 'Remove',
    });

    this.saveBtn = new LongButton(0, 0, 100, 36, new UIAnchor(false, true, true, true), 'Save Setup');
    this.saveBtn.node.style.position = 'relative';
    this.saveBtn.node.style.margin = '8px auto';
    this.saveBtn.addEventListener('click', (evt) => {
      evt.stopPropagation();
      if (this.saveHandler !== undefined) {
        this.saveHandler();
      }
    });
    this.panelContainer.appendChild(this.saveBtn.node);
  }

  addFurniture(furniture) {
    this.furnitures.push(furniture);
    const sprite = super.drawImage((ctx) => {
      furniture.sprite.drawAt(ctx, 0, 0, 72, 72);
    });

    const node = createElement('div', {
      style: {
        width: '72px',
        height: '72px',
      },
    });
    node.style.background = sprite;

    const container = createElement('div', {}, node);
    if (this.furnitures.length === 1) {
      container.classList.add('selected');
      this.selectedFurniture = furniture.id;
    }

    this.furnitureList.appendChild(container);
    container.addEventListener('click', (evt) => {
      evt.stopPropagation();
      Array.from(this.furnitureList.getElementsByClassName('selected')).forEach((x) => x.classList.remove('selected'));
      container.classList.add('selected');
      this.selectedFurniture = furniture.id;
    });
  }

  getSelectedFurniture() {
    return this.selectedFurniture;
  }

  setSaveHandler(handler) {
    this.saveHandler = handler;
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
