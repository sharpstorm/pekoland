import UIElement from './ui-element.js';
import Sprite from '../models/sprites.js';
import SpriteManager from '../managers/sprite-manager.js';

export default class Button extends UIElement {
  constructor(marginX, marginY, width, height, anchor, content) {
    super(marginX, marginY, width, height, anchor);

    this.hover = false;

    this.cache = document.createElement('canvas');
    this.cache.width = width;
    this.cache.height = height;
    const ctx = this.cache.getContext('2d');
    SpriteManager.getInstance().getSprite('button').drawAt(ctx, 0, 0, width, height);

    if (content instanceof Sprite) {
      content.drawAt(ctx, (width - content.width) / 2, (height - content.height) / 2);
    } else if (typeof content === 'string') {
      const textWidth = ctx.measureText(content).width;
      ctx.font = '16px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(content, (width - textWidth) / 2, (height - 16) / 2);
    }

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
    console.log(this.getBoundingBox(camContext));
    console.log(camContext);
    const currentState = this.getState(camContext);

    ctx.drawImage(this.cache, 0, 0, this.width, this.height,
      this.resolveX(camContext.viewportWidth), this.resolveY(camContext.viewportHeight),
      this.width, this.height);

    this.lastState = currentState;
  }
}
