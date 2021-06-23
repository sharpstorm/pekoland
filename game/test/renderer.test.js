import { expect, jest, test } from '@jest/globals';
import Renderer from '../managers/animation-manager';
import MapManager from '../managers/map-manager';
import PlayerManager from '../managers/player-manager';
import Player from '../models/player';
import { getDummyContext } from './mock-canvas';

test('[Renderer] Test Render Camera', () => {
  Renderer.init();

  expect(Renderer.getCameraContext()).toBeDefined();

  Renderer.getCameraContext().x = 0;
  Renderer.getCameraContext().y = 0;
  expect(Renderer.getCameraContext().x).toBe(0);
  expect(Renderer.getCameraContext().y).toBe(0);

  Renderer.nudgeCamera(50, 100);
  expect(Renderer.getCameraContext().newX).toBe(50);
  expect(Renderer.getCameraContext().newY).toBe(100);

  Renderer.moveCamera(200, 200);
  expect(Renderer.getCameraContext().newX).toBe(200);
  expect(Renderer.getCameraContext().newY).toBe(200);

  // Test Window Resize
  const changeSize = (width, height) => {
    Renderer.dimens = {
      width,
      height,
    };

    Renderer.synchronizeCanvasSize();
    Renderer.getCameraContext().updateViewport(Renderer.dimens);
  };

  changeSize(400, 400);
  expect(Renderer.getCameraContext().viewportWidth).toBe(400);
  expect(Renderer.getCameraContext().viewportHeight).toBe(400);

  // Cam Center
  Renderer.getCameraContext().centerOn(100, 100);
  expect(Renderer.getCameraContext().x).toBe(-100);
  expect(Renderer.getCameraContext().y).toBe(-100);

  // Test Camera Animate
  Renderer.moveCamera(200, -100);
  expect(Renderer.getCameraContext().newX).toBe(200);
  Renderer.getCameraContext().animate(16.66667);
  expect(Renderer.getCameraContext().x).toBeGreaterThan(-100);

  Renderer.getCameraContext().x = -100;
  Renderer.moveCamera(-100, 200);
  expect(Renderer.getCameraContext().newY).toBe(200);
  Renderer.getCameraContext().animate(16.66667);
  expect(Renderer.getCameraContext().y).toBeGreaterThan(-100);
});

test('[Renderer] Test Render Layers', () => {
  Renderer.init();

  expect(Renderer.getUILayer()).toBeDefined();
  expect(Renderer.getGameLayer()).toBeDefined();

  // UI Layer
  expect(Renderer.getUILayer().domElement).toBeDefined();
  expect(Renderer.getUILayer().domElement.children.length).toBe(0);
  expect(Renderer.getUILayer().elements.length).toBe(0);
  Renderer.getUILayer().addElement({
    getDOMNode: () => document.createElement('div'),
  });
  expect(Renderer.getUILayer().domElement.children.length).toBe(1);
  expect(Renderer.getUILayer().elements.length).toBe(1);

  // Game layer
  expect(Renderer.getGameLayer().drawables.length).toBe(0);
  const drawer = jest.fn();
  const eventHandler = jest.fn();
  Renderer.getGameLayer().register({
    draw: drawer,
    handleEvent: eventHandler,
  });
  expect(Renderer.getGameLayer().drawables.length).toBe(1);

  expect(drawer).not.toHaveBeenCalled();
  Renderer.render(0);
  expect(drawer).toHaveBeenCalled();

  expect(eventHandler).not.toHaveBeenCalled();
  Renderer.propagateEvent('id', 'evt');
  expect(eventHandler).toHaveBeenCalled();
});

test('[Renderer] Test Render Path', () => {
  Renderer.init();

  // Tap on ctx
  const ctx = getDummyContext();
  Renderer.ctx = ctx;

  const playerDraw1 = jest.fn();
  const playerDraw2 = jest.fn();
  PlayerManager.getInstance().addPlayer(new Player('id1', 'name1', {
    getSpriteByDirection: () => ({
      getSpriteAtFrame: () => ({
        drawAt: playerDraw1,
      }),
    }),
  }));

  expect(playerDraw1).not.toHaveBeenCalled();
  Renderer.render(0);
  expect(playerDraw1).toHaveBeenCalled();
  expect(playerDraw2).not.toHaveBeenCalled();

  PlayerManager.getInstance().addPlayer(new Player('id2', 'name2', {
    getSpriteByDirection: () => ({
      getSpriteAtFrame: () => ({
        drawAt: playerDraw2,
      }),
    }),
  }));
  Renderer.render(0);
  expect(playerDraw1).toHaveBeenCalledTimes(2);
  expect(playerDraw2).toHaveBeenCalled();

  const drawerMap = jest.fn();
  MapManager.getInstance().registerMap('map1', {
    draw: drawerMap,
  });
  Renderer.render(0);
  expect(drawerMap).toHaveBeenCalled();
});
