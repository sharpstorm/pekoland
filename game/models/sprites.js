class Sprite {
  constructor(spritesheet, x, y, width, height) {
    this.spritesheet = spritesheet;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
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

export { Sprite as default, AnimatableSprite, AvatarSprite };