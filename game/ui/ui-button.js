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
    this.node.appendChild(this.button);
    this.redraw();
  }

  redraw() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const { width, height } = this;

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

    const { content } = this;
    if (content.drawAt !== undefined) {
      content.drawAt(ctx, (width - content.width) / 2, (height - content.height) / 2);
    } else if (typeof content === 'string') {
      ctx.font = '16px Arial';
      ctx.fillStyle = '#000';
      const textWidth = ctx.measureText(content).width;
      ctx.fillText(content, (width - textWidth) / 2, (height - 16) / 2 + 10);
    }

    this.button.style.background = `url('${canvas.toDataURL()}')`;
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
    super(marginX, marginY, width, height, anchor, content, SpriteManager.getInstance().getSprite('button-long'));
  }
}

export { Button as default, LongButton };
