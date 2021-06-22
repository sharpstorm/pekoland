import { expect, jest, test } from '@jest/globals';
import Sprite, { AnimatableSprite, AvatarSprite, SlicedSprite, TiledSprite } from '../models/sprites';
import { getDummyContext } from './mock-canvas';
import Player from '../models/player';

test('[Sprite] Test Basic Sprite', () => {
  const sprite = new Sprite('test', 1, 2, 3, 4);
  expect(sprite.x).toBe(1);
  expect(sprite.y).toBe(2);
  expect(sprite.width).toBe(3);
  expect(sprite.height).toBe(4);

  const ctx = getDummyContext();
  sprite.drawAt(ctx, 10, 11, 12, 13);
  expect(ctx.history.length).toBe(1);
  const drawn = ctx.history.find((x) => x.object === 'drawImage');
  expect(drawn).toBeDefined();
  expect(drawn.image).toBe('test');

  // Source
  expect(drawn.params[0]).toBe(1);
  expect(drawn.params[1]).toBe(2);
  expect(drawn.params[2]).toBe(3);
  expect(drawn.params[3]).toBe(4);

  // Dest
  expect(drawn.params[4]).toBe(10);
  expect(drawn.params[5]).toBe(11);
  expect(drawn.params[6]).toBe(12);
  expect(drawn.params[7]).toBe(13);

  const ctx2 = getDummyContext();
  sprite.drawAt(ctx2, 10, 11);
  const drawn2 = ctx2.history.find((x) => x.object === 'drawImage');
  expect(drawn2).toBeDefined();

  expect(drawn2.params[6]).toBe(3);
  expect(drawn2.params[7]).toBe(4);
});

test('[Sprite] Test Animatable Sprite', () => {
  const sprite = new AnimatableSprite(['a1', 'b2', 'c3', 'd4']);

  expect(sprite.getFrameCount()).toBe(4);
  expect(sprite.getSpriteAtFrame(0)).toBe('a1');
  expect(sprite.getSpriteAtFrame(1)).toBe('b2');
  expect(sprite.getSpriteAtFrame(3)).toBe('d4');

  const sprite2 = AnimatableSprite.generateFromTiledFrames('test',
    1, 2, 3, 4, 5, 6, 7);
  expect(sprite2.getFrameCount()).toBe(7);
  expect(sprite2.getSpriteAtFrame(0).x).toBe(1);
  expect(sprite2.getSpriteAtFrame(0).y).toBe(2);
  expect(sprite2.getSpriteAtFrame(0).width).toBe(3);
  expect(sprite2.getSpriteAtFrame(0).height).toBe(4);
  expect(sprite2.getSpriteAtFrame(1).x).toBe(6);
  expect(sprite2.getSpriteAtFrame(1).y).toBe(8);
  expect(sprite2.getSpriteAtFrame(1).width).toBe(3);
  expect(sprite2.getSpriteAtFrame(1).height).toBe(4);

  expect(sprite2.getSpriteAtFrame(1).spritesheet).toBe('test');
});

test('[Sprite] Test Avatar Sprite', () => {
  const sprite = new AvatarSprite('a1', 'b2', 'c3', 'd4');

  expect(sprite.getSpriteByDirection(Player.DirectionToIntMap.up)).toBe('a1');
  expect(sprite.getSpriteByDirection(Player.DirectionToIntMap.right)).toBe('b2');
  expect(sprite.getSpriteByDirection(Player.DirectionToIntMap.down)).toBe('c3');
  expect(sprite.getSpriteByDirection(Player.DirectionToIntMap.left)).toBe('d4');
});

test('[Sprite] Test Sliced Sprite', () => {
  const sprite = SlicedSprite.from('pic', [
    [0, 0, 1, 1],
    [1, 0, 1, 1],
    [2, 0, 1, 1],
    [0, 1, 1, 1],
    [1, 1, 1, 1],
    [2, 1, 1, 1],
    [0, 2, 1, 1],
    [1, 2, 1, 1],
    [2, 2, 1, 1],
  ]);

  const ctx = getDummyContext();
  sprite.drawAt(ctx, 0, 0, 3, 3);
  expect(ctx.history.length).toBe(9);

  ctx.history.length = 0;
  sprite.drawAt(ctx, 0, 0, 4, 3); // Row Tile Strategy
  expect(ctx.history.length).toBe(9);

  ctx.history.length = 0;
  sprite.interpolateMode = SlicedSprite.TILE;
  sprite.drawAt(ctx, 0, 0, 4, 4); // Row Tile Strategy
  expect(ctx.history.length).toBe(10);
});

test('[Sprite] Test Tiled Sprite', () => {
  const baseSprite = new Sprite('pic', 0, 0, 1, 1);
  const sprite = new TiledSprite(baseSprite, 1, 1);

  const ctx = getDummyContext();
  sprite.drawAt(ctx, 0, 0, 3, 3);
  expect(ctx.history.length).toBe(3);

  ctx.history.length = 0;
  sprite.drawAt(ctx, 0, 0, 4, 3); // Row Tile Strategy
  expect(ctx.history.length).toBe(3);

  ctx.history.length = 0;
  sprite.drawAt(ctx, 0, 0, 4, 4); // Row Tile Strategy
  expect(ctx.history.length).toBe(4);
});
