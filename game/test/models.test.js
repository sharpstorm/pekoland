import { expect, jest, test } from '@jest/globals';
import GameConstants from '../game-constants';
import SpriteManager from '../managers/sprite-manager';
import Chat from '../models/chat';
import Player from '../models/player';
import { loadAsset } from '../utils';
import loadAssets from '../workers/asset-loader';
import { getDummyContext } from './mock-canvas';

jest.mock('../utils');
loadAsset.mockImplementation((assetList) => {
  return new Promise((resolve) => {
    resolve(assetList);
  });
});

beforeAll(async () => {
  await loadAssets();
})

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

