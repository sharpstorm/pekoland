import { expect, jest, test } from '@jest/globals';
import GameConstants from '../game-constants';
import SpriteManager from '../managers/sprite-manager';
import Chat from '../models/chat';
import Player from '../models/player';
import Map from '../models/map';
import { loadAsset } from '../utils';
import loadAssets from '../workers/asset-loader';
import { getDummyContext } from './mock-canvas';

jest.mock('../utils');
loadAsset.mockImplementation((assetList) => new Promise((resolve) => resolve(assetList)));

// eslint-disable-next-line no-undef
beforeAll(async () => { await loadAssets(); });

test('[Model] Test Chat Bubble', () => {
  const chat = new Chat();
  const ctx = getDummyContext();

  expect(chat.currentSpeech).toBe('');
  chat.drawAt(ctx);
  expect(ctx.history.length).toBe(0); // Not Supposed to draw empty

  // Set and Show
  chat.updateMessage('Test');
  expect(chat.currentSpeech).toBe('Test');
  expect(chat.speechBubble).toBe(true);
  expect(chat.speechBubbleCounter).toBe(0);

  // Draw
  chat.drawAt(ctx, 0, 0);
  expect(ctx.history.length).toBe(1);
  const bubble = ctx.history.find((x) => x.object === 'drawImage');
  expect(bubble).toBeDefined();
  expect(chat.cachedSprite).toBeDefined();
  expect(chat.speechBubbleCounter).toBe(1);
});

test('[Model] Test Chat Bubble Caching', () => {
  const chat = new Chat();
  const ctx = getDummyContext();

  expect(chat.currentSpeech).toBe('');
  chat.updateMessage('Test');
  chat.drawAt(ctx, 0, 0);
  expect(ctx.history.length).toBe(1);
  const bubble = ctx.history.find((x) => x.object === 'drawImage');
  expect(bubble).toBeDefined();
  expect(chat.cachedSprite).toBeDefined();
  const cached = chat.cachedSprite;
  expect(chat.speechBubbleCounter).toBe(1);

  // Cached Draw
  ctx.history.length = 0;
  chat.drawAt(ctx, 0, 0);
  const bubble2 = ctx.history.find((x) => x.object === 'drawImage');
  expect(bubble2.image).toBe(bubble.image);
  expect(chat.cachedSprite).toBe(cached);
  expect(chat.speechBubbleCounter).toBe(2);

  // Cache Refresh
  chat.updateMessage('Test2');
  ctx.history.length = 0;
  chat.drawAt(ctx, 0, 0);
  const bubble3 = ctx.history.find((x) => x.object === 'drawImage');
  expect(bubble3.image).not.toBe(bubble2.image);
  expect(bubble3.image).not.toBe(bubble.image);
  expect(chat.cachedSprite).not.toBe(cached);
  expect(chat.speechBubbleCounter).toBe(1);
});

test('[Model] Test Player Movement', () => {
  const p = new Player();

  expect(p.x).toBe(400);
  expect(p.y).toBe(1000);

  // Animated Move
  p.moveTo(100, 100);
  expect(p.newX).toBe(100);
  expect(p.newY).toBe(100);
  expect(p.isAnimating).toBe(true);
  p.isAnimating = false;
  p.currentFrame = 6;

  // Immediate Move
  p.moveImmediate(200, 200);
  expect(p.x).toBe(200);
  expect(p.y).toBe(200);

  // Grid Coordinate Move
  p.moveToGrid(1, 1);
  expect(p.x).toBe(0);
  expect(p.y).toBe(0);
  expect(p.getGridCoord().x).toBe(1);
  expect(p.getGridCoord().y).toBe(1);

  p.moveToGrid(4, 5);
  expect(p.x).toBe(3 * GameConstants.UNIT);
  expect(p.y).toBe(4 * GameConstants.UNIT);
  expect(p.getGridCoord().x).toBe(4);
  expect(p.getGridCoord().y).toBe(5);
});

test('[Model] Test Player Draw', () => {
  const p = new Player('id', 'name', SpriteManager.getInstance().getSprite('rabbit-avatar'));

  expect(p.x).toBe(400);
  expect(p.y).toBe(1000);

  const ctx = getDummyContext();
  p.drawAt(ctx, 0, 0, 50, 50, { x: 0, y: 0 });
  expect(ctx.history.length).toBe(2); // Only sprite and nametag

  const nametag = ctx.history.find((x) => x.object === 'text');
  expect(nametag).toBeDefined();
  expect(nametag.text).toContain('name');

  const avatar = ctx.history.find((x) => x.object === 'drawImage');
  expect(avatar).toBeDefined();

  const bounds = avatar.params;
  expect(bounds[4]).toBeGreaterThanOrEqual(p.x);
  expect(bounds[4]).toBeLessThanOrEqual(p.x + 50);
  expect(bounds[5]).toBeGreaterThanOrEqual(p.y);
  expect(bounds[5]).toBeLessThanOrEqual(p.y + 50);

  expect(bounds[6]).toBeLessThanOrEqual(50);
  expect(bounds[7]).toBeLessThanOrEqual(50);
});

test('[Model] Test Player Draw with chat', () => {
  const p = new Player('id', 'name', SpriteManager.getInstance().getSprite('rabbit-avatar'));
  p.chat.updateMessage('Test');

  expect(p.x).toBe(400);
  expect(p.y).toBe(1000);

  const ctx = getDummyContext();
  p.drawAt(ctx, 0, 0, 50, 50, { x: 0, y: 0 });
  expect(ctx.history.length).toBe(3);

  const sprites = ctx.history.filter((x) => x.object === 'drawImage');
  expect(sprites.length).toBe(2);
});

test('[Model] Test Player Draw direction', () => {
  const p = new Player('id', 'name', SpriteManager.getInstance().getSprite('rabbit-avatar'));
  expect(p.direction).toBe(Player.Direction.DOWN);

  // DOWN
  const ctx = getDummyContext();
  p.drawAt(ctx, 0, 0, 50, 50, { x: 0, y: 0 });
  const downSprite = ctx.history.find((x) => x.object === 'drawImage');
  expect(downSprite).toBeDefined();

  // UP
  ctx.history.length = 0;
  p.direction = Player.Direction.UP;
  p.drawAt(ctx, 0, 0, 50, 50, { x: 0, y: 0 });
  const upSprite = ctx.history.find((x) => x.object === 'drawImage');
  expect(upSprite).toBeDefined();

  // LEFT
  ctx.history.length = 0;
  p.direction = Player.Direction.LEFT;
  p.drawAt(ctx, 0, 0, 50, 50, { x: 0, y: 0 });
  const leftSprite = ctx.history.find((x) => x.object === 'drawImage');
  expect(leftSprite).toBeDefined();

  // RIGHT
  ctx.history.length = 0;
  p.direction = Player.Direction.RIGHT;
  p.drawAt(ctx, 0, 0, 50, 50, { x: 0, y: 0 });
  const rightSprite = ctx.history.find((x) => x.object === 'drawImage');
  expect(rightSprite).toBeDefined();

  expect(downSprite.params[1]).not.toBe(upSprite.params[1]);
  expect(downSprite.params[1]).not.toBe(rightSprite.params[1]);
  expect(downSprite.params[1]).not.toBe(leftSprite.params[1]);
  expect(upSprite.params[1]).not.toBe(rightSprite.params[1]);
  expect(upSprite.params[1]).not.toBe(leftSprite.params[1]);
  expect(rightSprite.params[1]).not.toBe(leftSprite.params[1]);
});

test('[Model] Test Map Initialization', () => {
  const map = new Map('map', [
    [0, 0, 0, 255],
    [255, 255, 255, 255],
    [255, 0, 0, 255],
    [0, 0, 0, 255],
  ], 10, 10, 2, 2);

  expect(map.getUnitLength()).toBe(5);

  expect(map.checkCollision(0, 0)).toBe(true);
  expect(map.checkCollision(0, GameConstants.UNIT)).toBe(false);
  expect(map.checkCollision(GameConstants.UNIT, 0)).toBe(true);
  expect(map.checkCollision(GameConstants.UNIT, GameConstants.UNIT)).toBe(true);

  expect(map.getFurniture(0, 0)).toBeUndefined();
  expect(map.getFurniture(0, GameConstants.UNIT)).toBeUndefined();
  expect(map.getFurniture(GameConstants.UNIT, 0)).toBe('BoardGame');
  expect(map.getFurniture(GameConstants.UNIT, GameConstants.UNIT)).toBeUndefined();
});

test('[Model] Test Map Draw', () => {
  const map = new Map('map', [
    [0, 0, 0, 255],
    [255, 255, 255, 255],
    [255, 0, 0, 255],
    [0, 0, 0, 255],
  ], 10, 10, 2, 2);

  const ctx = getDummyContext();
  map.draw(ctx, {
    x: 0,
    y: 0,
    viewportWidth: 100,
    viewportHeight: 100,
  });

  expect(ctx.history.length).toBe(1);
  const sprite = ctx.history.find((x) => x.object === 'drawImage');
  expect(sprite).toBeDefined();

  expect(sprite.image).toBe('map');
  expect(sprite.params[4]).toBe(0);
  expect(sprite.params[5]).toBe(0);
  expect(sprite.params[6]).toBe(100);
  expect(sprite.params[7]).toBe(100);
});
