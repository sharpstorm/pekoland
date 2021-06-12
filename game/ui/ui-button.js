import UIElement from './ui-element.js';
import SpriteManager from '../managers/sprite-manager.js';

class Button extends UIElement {
  constructor(marginX, marginY, width, height, anchor, content, background) {
    super(marginX, marginY, width, height, anchor);

    this.content = content;
    this.background = background;
    this.hover = false;
    this.visible = true;

    this.cache = document.createElement('canvas');
    this.cache.width = width;
    this.cache.height = height;
    this.updateCache();
  }

  updateCache() {
    const ctx = this.cache.getContext('2d');
    const { width, height } = this.cache;
    ctx.clearRect(0, 0, width, height);

    if (this.background && this.background.drawAt !== undefined) {
      this.background.drawAt(ctx, 0, 0, width, height);
    } else {
      SpriteManager.getInstance().getSprite('button').drawAt(ctx, 0, 0, width, height);
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

    this.lastState = undefined; // Force redraw
  }

  setContent(content) {
    this.content = content;
    this.updateCache();
  }

  setVisible(isVisible) {
    this.visible = isVisible;
    this.lastState = undefined;
  }

  // eslint-disable-next-line class-methods-use-this
  getState(camContext) {
    return {
      viewportHeight: camContext.viewportHeight,
      viewportWidth: camContext.viewportWidth,
      hover: this.hover,
    };
  }

  isDirty(camContext) {
    const currentState = this.getState(camContext);
    return this.lastState === undefined
      || this.lastState.viewportHeight !== currentState.viewportHeight
      || this.lastState.viewportWidth !== currentState.viewportWidth
      || this.lastState.hover !== currentState.hover;
  }

  render(ctx, camContext) {
    if (!this.visible) {
      return;
    }
    const currentState = this.getState(camContext);

    ctx.drawImage(this.cache, 0, 0, this.width, this.height,
      this.resolveX(camContext.viewportWidth), this.resolveY(camContext.viewportHeight),
      this.width, this.height);

    this.lastState = currentState;
  }
}

class LongButton extends Button {
  constructor(marginX, marginY, width, height, anchor, content) {
    super(marginX, marginY, width, height, anchor, content, SpriteManager.getInstance().getSprite('button-long'));
  }
}

export { Button as default, LongButton };
