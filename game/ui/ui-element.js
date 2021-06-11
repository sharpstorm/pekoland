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
    this.eventHandlers = {};
  }

  resolveX(viewportWidth) {
    const alignMode = this.anchor.getXAlignMode();
    if (alignMode === UIAnchor.AlignMode.BEGIN) {
      return this.marginX;
    } else if (alignMode === UIAnchor.AlignMode.MIDDLE) {
      return ((viewportWidth - this.width) / 2) + this.marginX;
    } else {
      return viewportWidth - this.width - this.marginX;
    }
  }

  resolveY(viewportHeight) {
    const alignMode = this.anchor.getYAlignMode();
    if (alignMode === UIAnchor.AlignMode.BEGIN) {
      return this.marginY;
    } else if (alignMode === UIAnchor.AlignMode.MIDDLE) {
      return ((viewportHeight - this.height) / 2) + this.marginY;
    } else {
      return viewportHeight - this.height - this.marginY;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getBoundingBox(camContext) {
    return {
      x: this.resolveX(camContext.viewportWidth),
      y: this.resolveY(camContext.viewportHeight),
      width: this.width,
      height: this.height,
    };
  }
}

export { UIElement as default, UIAnchor };
