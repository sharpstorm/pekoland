import UIElement from './ui-element.js';
import SpriteManager from '../managers/sprite-manager.js';
import { createElement } from './ui-utils.js';

class Button extends UIElement {
  constructor(marginX, marginY, width, height, anchor, content, background, hoverBackground) {
    super(marginX, marginY, width, height, anchor);

    this.content = content;
    this.background = background;
    this.hoverBackground = hoverBackground;
    this.hover = false;
    this.visible = true;
    this.initObject();
  }

  initObject() {
    this.button = createElement('div', { className: 'game-btn' });
    this.contentArea = createElement('div', { className: 'game-btn-inner' });
    this.button.appendChild(this.contentArea);
    this.node.appendChild(this.button);
    this.redraw();

    this.button.addEventListener('mouseenter', () => {
      this.hover = true;
      this.redraw();
    });

    this.button.addEventListener('mouseleave', () => {
      this.hover = false;
      this.redraw();
    });
  }

  redraw() {
    const { width, height } = this;
    const backImg = this.drawImage((ctx) => {
      if (!this.hover && this.isBackgroundValid()) {
        this.background.drawAt(ctx, 0, 0, width, height);
      } else if (!this.hover) {
        SpriteManager.getInstance().getSprite('button').drawAt(ctx, 0, 0, width, height);
      } else if (this.hover && this.isHoverBackgroundValid()) {
        this.hoverBackground.drawAt(ctx, 0, 0, width, height);
      } else if (this.hover && !this.isHoverBackgroundValid() && this.isBackgroundValid()) {
        this.background.drawAt(ctx, 0, 0, width, height);
      } else {
        SpriteManager.getInstance().getSprite('button-shaded').drawAt(ctx, 0, 0, width, height);
      }
    });
    this.button.style.background = backImg;

    const { content } = this;
    if (content.drawAt !== undefined) {
      const contentImg = this.drawImage((ctx) => {
        content.drawAt(ctx, (width - content.width) / 2, (height - content.height) / 2);
      });
      this.contentArea.style.background = contentImg;
    } else if (typeof content === 'string') {
      this.contentArea.textContent = content;
      this.contentArea.style.color = '#000';
    }
  }

  drawImage(drawFunc) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const { width, height } = this;
    canvas.width = width;
    canvas.height = height;

    drawFunc(ctx);
    return `url('${canvas.toDataURL()}')`;
  }

  setContent(content) {
    this.content = content;
    this.redraw();
  }

  setBackground(background) {
    this.background = background;
    this.redraw();
  }

  setHoverBackground(hoverBackground) {
    this.hoverBackground = hoverBackground;
    this.redraw();
  }

  isBackgroundValid() {
    return this.background && this.background.drawAt !== undefined;
  }

  isHoverBackgroundValid() {
    return this.hoverBackground && this.hoverBackground.drawAt !== undefined;
  }

  setVisible(isVisible) {
    this.visible = isVisible;
    this.node.style.display = isVisible ? '' : 'none';
  }
}

class LongButton extends Button {
  constructor(marginX, marginY, width, height, anchor, content) {
    super(marginX, marginY, width, height, anchor, content, SpriteManager.getInstance().getSprite('button-long'),
      SpriteManager.getInstance().getSprite('button-long-shaded'));
  }
}

export { Button as default, LongButton };
