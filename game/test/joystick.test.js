/**
 * @jest-environment jsdom
 */

import { expect, jest, test } from '@jest/globals';
import PlayerManager from '../managers/player-manager';
import Player from '../models/player';
import MapManager from '../managers/map-manager';
import GameConstants from '../game-constants.js';
import {
  joystickWorker,
  addJoystickEventHandler,
  removeJoystickEventHandler,
} from '../workers/joystick.js';

jest.mock('../managers/player-manager');

const fakeMap = {
  checkCollision: () => false,
}

jest.mock('../managers/map-manager');
MapManager.getInstance.mockImplementation(() => ({
  getCurrentMap: () => fakeMap,
}));

beforeEach(() => {
  PlayerManager.mockClear();
  const self = {
    userId: 'Test1',
    x: 100,
    y: 100,
    direction: 0,
    isAnimating: false,
    currentFrame: 6,
  };

  self.moveTo = (x, y) => {
    self.testX = x;
    self.testY = y;
  }

  self.resetAnim = () => {
    self.isAnimating = false;
    self.currentFrame = 6;
  }

  self.reset = () => {
    self.x = 100;
    self.y = 100;
    self.direction = 0;
    self.resetAnim();
  }

  PlayerManager.getInstance.mockImplementation(() => {
    return {
      getSelf: () => self, 
    };
  });
})

test('[Joystick] Test Joystick', () => {
  const self = PlayerManager.getInstance().getSelf();
  expect(self.testX).toBeUndefined();
  expect(self.testY).toBeUndefined();

  // LEFT ARROW
  joystickWorker({
    keyCode: 37,
  });

  expect(self.testX).toBe(100 - GameConstants.UNIT);
  expect(self.testY).toBe(100);

  // RIGHT ARROW
  self.reset();
  joystickWorker({
    keyCode: 39,
  });

  expect(self.testX).toBe(100 + GameConstants.UNIT);
  expect(self.testY).toBe(100);

  // UP ARROW
  self.reset();
  joystickWorker({
    keyCode: 38,
  });

  expect(self.testX).toBe(100);
  expect(self.testY).toBe(100 - GameConstants.UNIT);

  // DOWN ARROW
  self.reset();
  joystickWorker({
    keyCode: 40,
  });

  expect(self.testX).toBe(100);
  expect(self.testY).toBe(100 + GameConstants.UNIT);
});

test('[Joystick] Test Joystick Debouncing', () => {
  const self = PlayerManager.getInstance().getSelf();
  expect(self.testX).toBeUndefined();
  expect(self.testY).toBeUndefined();

  // LEFT ARROW
  joystickWorker({
    keyCode: 37,
  });

  expect(self.testX).toBe(100 - GameConstants.UNIT);
  expect(self.testY).toBe(100);

  joystickWorker({
    keyCode: 39,
  });

  expect(self.testX).toBe(100 - GameConstants.UNIT);
  expect(self.testY).toBe(100);

  self.resetAnim();
  joystickWorker({
    keyCode: 39,
  });

  expect(self.testX).toBe(100 + GameConstants.UNIT);
  expect(self.testY).toBe(100);

});

test('[Joystick] Test Joystick Event Handling', () => {
  const self = PlayerManager.getInstance().getSelf();

  let fired = false;
  let expectedDirection = undefined;
  let expectedDeltaX = 0;
  let expectedDeltaY = 0;
  const configExpected = (dir, x, y) => {
    fired = false;
    expectedDirection = dir;
    expectedDeltaX = x * GameConstants.UNIT;
    expectedDeltaY = y * GameConstants.UNIT;
  }

  addJoystickEventHandler((evt) => {
    expect(evt.id).toBe(expectedDirection);
    expect(evt.deltaX).toBe(expectedDeltaX);
    expect(evt.deltaY).toBe(expectedDeltaY);
    expect(evt.x).toBe(100 + expectedDeltaX);
    expect(evt.y).toBe(100 + expectedDeltaY);
    fired = true;
  });

  // LEFT ARROW
  configExpected(Player.Direction.LEFT, -1, 0);
  joystickWorker({
    keyCode: 37,
  });
  expect(fired).toBe(true);

  // Right Arrow
  self.resetAnim();
  configExpected(Player.Direction.RIGHT, 1, 0);
  joystickWorker({
    keyCode: 39,
  });
  expect(fired).toBe(true);

  // Up Arrow
  self.resetAnim();
  configExpected(Player.Direction.UP, 0, -1);
  joystickWorker({
    keyCode: 38,
  });
  expect(fired).toBe(true);

  // Down Arrow
  self.resetAnim();
  configExpected(Player.Direction.DOWN, 0, 1);
  joystickWorker({
    keyCode: 40,
  });
  expect(fired).toBe(true);
});

