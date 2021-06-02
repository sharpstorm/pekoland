class Sprite {
  constructor(spritesheet, x, y, width, height) {
    this.spritesheet = spritesheet;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  drawAt(ctx, x, y, width, height) {
    if (width === undefined) width = this.width;
    if (height === undefined) height = this.height;
    ctx.drawImage(this.spritesheet, this.x, this.y, this.width, this.height, x, y, width, height);
  }
}

class AnimatableSprite {
  constructor(frames) {
    this.frames = frames;
  }

  getSpriteAtFrame(frameNo) {
    return this.frames[frameNo];
  }

  getFrameCount() {
    return this.frames.length;
  }

  static generateFromTiledFrames(spritesheet, x, y, width, height, deltaX, deltaY, frameCount) {
    let frames = [];
    for (let i = 0; i < frameCount; i++) {
      frames.push(new Sprite(spritesheet, x + (i * deltaX), y + (i * deltaY), width, height));
    }
    return new AnimatableSprite(frames);
  }
}

class AvatarSprite {
  constructor(up, right, down, left) {
    this.up = up;
    this.down = down;
    this.right = right;
    this.left = left;
  }

  getSpriteByDirection(direction) {
    if (direction === 0) {
      return this.up;
    } else if (direction === 1) {
      return this.right;
    } else if (direction === 2) {
      return this.down;
    } else if (direction === 3) {
      return this.left;
    }
  }
}

class SlicedSprite {
  // See https://docs.unity3d.com/Manual/9SliceSprites.html for how slices are arranged
  constructor(a, b, c, d, e, f, g, h, i) {
    this.sliceA = a;
    this.sliceB = b;
    this.sliceC = c;
    this.sliceD = d;
    this.sliceE = e;
    this.sliceF = f;
    this.sliceG = g;
    this.sliceH = h;
    this.sliceI = i;

    this.interpolateMode = SlicedSprite.STRETCH;
  }

  drawAt(ctx, x, y, width, height) {
    let widthDiff = width - (this.sliceA.width + this.sliceC.width);
    if (widthDiff < 0) {
      widthDiff = 0;
    }

    let heightDiff = height - (this.sliceA.height + this.sliceG.height);
    if (heightDiff < 0) {
      heightDiff = 0;
    }

    // Draw 4 Corners
    this.sliceA.drawAt(ctx, x, y);
    this.sliceC.drawAt(ctx, x + this.sliceA.width + widthDiff, y);
    this.sliceG.drawAt(ctx, x, y + this.sliceA.height + heightDiff);
    this.sliceI.drawAt(ctx, x + this.sliceA.width + widthDiff, y + this.sliceA.height + heightDiff);

    if (widthDiff > 0) {
      this.sliceB.drawAt(ctx, x + this.sliceA.width, y, widthDiff, this.sliceB.height);
      this.sliceH.drawAt(ctx, x + this.sliceA.width, y + this.sliceA.height + heightDiff, widthDiff, this.sliceH.height);
    }

    if (heightDiff > 0) {
      this.sliceD.drawAt(ctx, x, y + this.sliceA.height, this.sliceD.width, heightDiff);
      this.sliceF.drawAt(ctx, x + this.sliceA.width + widthDiff, y + this.sliceA.height, this.sliceF.width, heightDiff);
    }

    if (heightDiff > 0 && widthDiff > 0) {
      this.sliceE.drawAt(ctx, x + this.sliceA.width, y + this.sliceA.height, widthDiff, heightDiff);
    }
  }

  // partsArray should be provided as an array of 4-tuples, with [x, y, width, height]
  static from(spritesheet, partsArray) {
    if (partsArray.length < 9) {
      throw 'Invalid Parts Array';
    }

    let arr = [];
    for (let i = 0; i < 9; i++) {
      let curPart = partsArray[i];
      if (curPart.length < 4) {
        throw `Invalid Part ${i}`;
      }
      arr.push(new Sprite(spritesheet, curPart[0], curPart[1], curPart[2], curPart[3]));
    }

    return new SlicedSprite(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6], arr[7], arr[8]);
  }
}

SlicedSprite.STRETCH = 0;
//SlicedSprite.TILE = 1; // TODO: Support Tiling

class TiledSprite {
  constructor() {

  }
}

export { Sprite as default, AnimatableSprite, AvatarSprite, SlicedSprite, TiledSprite };