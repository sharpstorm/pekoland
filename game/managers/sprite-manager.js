let instance;

export default class SpriteManager {
  constructor() {
    this.sprites = {};
  }

  registerSprite(id, sprite) {
    this.sprites[id] = sprite;
  }

  removeSprite(id) {
    if (id in this.sprites) {
      delete this.sprites[id];
    }
  }

  getSprite(id) {
    return this.sprites[id];
  }

  static getInstance() {
    if (instance === undefined) {
      instance = new SpriteManager();
    }
    return instance;
  }
}
