export default class Furniture {
  constructor(typeId, name, sprite) {
    this.id = typeId;
    this.name = name;
    this.sprite = sprite;
  }

  drawAt(ctx, x, y, width, height) {
    this.sprite.drawAt(ctx, x, y, width, height);
  }
}
