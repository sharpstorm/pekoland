import { createElement } from './ui-utils.js';

/* eslint-disable no-else-return */
class UIAnchor {
  constructor(anchorTop, anchorRight, anchorBottom, anchorLeft) {
    this.anchorTop = anchorTop;
    this.anchorRight = anchorRight;
    this.anchorBottom = anchorBottom;
    this.anchorLeft = anchorLeft;
  }

  getXAlignMode() {
    if (this.anchorLeft && this.anchorRight) {
      return UIAnchor.AlignMode.MIDDLE;
    } else if (this.anchorRight && !this.anchorLeft) {
      return UIAnchor.AlignMode.END;
    } else {
      return UIAnchor.AlignMode.BEGIN;
    }
  }

  getYAlignMode() {
    if (this.anchorTop && this.anchorBottom) {
      return UIAnchor.AlignMode.MIDDLE;
    } else if (this.anchorBottom && !this.anchorTop) {
      return UIAnchor.AlignMode.END;
    } else {
      return UIAnchor.AlignMode.BEGIN;
    }
  }
}

UIAnchor.AlignMode = {
  BEGIN: 0,
  MIDDLE: 1,
  END: 2,
};

class UIElement {
  constructor(marginX, marginY, width, height, anchor) {
    this.marginX = marginX;
    this.marginY = marginY;
    this.width = width;
    this.height = height;
    this.anchor = anchor;
    this.initDOM();
  }

  initDOM() {
    this.node = createElement('div', {});
    this.node.style.width = this.width;
    this.node.style.height = this.height;
    this.node.style.position = 'absolute';
    this.anchorNode();
  }

  anchorNode() {
    const xAlignMode = this.anchor.getXAlignMode();
    const yAlignMode = this.anchor.getYAlignMode();

    if (xAlignMode === UIAnchor.AlignMode.BEGIN) {
      this.node.style.left = this.marginX;
    } else if (xAlignMode === UIAnchor.AlignMode.MIDDLE) {
      this.node.style.left = this.marginX;
      this.node.style.right = 0;
    } else {
      this.node.style.right = this.marginX;
    }

    if (yAlignMode === UIAnchor.AlignMode.BEGIN) {
      this.node.style.top = this.marginY;
    } else if (yAlignMode === UIAnchor.AlignMode.MIDDLE) {
      this.node.style.top = this.marginY;
      this.node.style.bottom = 0;
    } else {
      this.node.style.bottom = this.marginY;
    }
  }

  getDOMNode() {
    return this.node;
  }

  addEventListener(evtId, handler) {
    this.node.addEventListener(evtId, handler);
  }
}

export { UIElement as default, UIAnchor };
