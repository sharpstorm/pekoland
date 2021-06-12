import PlayerManager from '../managers/player-manager.js';
import Player from '../models/player.js';
import MapManager from '../managers/map-manager.js';
import Renderer from '../managers/animation-manager.js';
import GameConstants from '../game-constants.js';

const playerManager = PlayerManager.getInstance();

let joystickEventHandlers = [];

function joystickWorker(e) {
  const event = window.event ? window.event : e;

  if (event.keyCode === 37 || event.keyCode === 38
    || event.keyCode === 39 || event.keyCode === 40) {
    if (playerManager.getSelf().isAnimating) {
      return;
    }

    let deltaY = 0;
    let deltaX = 0;
    let direction;

    if (event.keyCode === 38) {
      deltaY = -GameConstants.UNIT;
      direction = Player.Direction.UP;
    } else if (event.keyCode === 40) {
      deltaY = GameConstants.UNIT;
      direction = Player.Direction.DOWN;
    } else if (event.keyCode === 37) {
      deltaX = -GameConstants.UNIT;
      direction = Player.Direction.LEFT;
    } else if (event.keyCode === 39) {
      deltaX = GameConstants.UNIT;
      direction = Player.Direction.RIGHT;
    } else {
      return;
    }

    const self = playerManager.getSelf();

    if (MapManager.getInstance().getCurrentMap()
      .checkCollision(playerManager.getSelf().x + deltaX, playerManager.getSelf().y + deltaY)) {
      deltaX = 0;
      deltaY = 0;
    }

    self.direction = direction;
    if (deltaX !== 0 || deltaY !== 0) {
      self.isAnimating = true;
      self.currentFrame = 0;
      Renderer.nudgeCamera(deltaX, deltaY);
      self.moveTo(self.x + deltaX, self.y + deltaY);
    }

    console.log(self.x, self.y);

    joystickEventHandlers.forEach((x) => x({
      id: direction,
      deltaX,
      deltaY,
      x: self.x + deltaX,
      y: self.y + deltaY,
    }));
  }
}

function joystickUpWorker(evt) {
  // const event = window.event ? window.event : e;
  return evt;
}

function addJoystickEventHandler(handler) {
  joystickEventHandlers.push(handler);
}

function removeJoystickEventHandler(handler) {
  joystickEventHandlers = joystickEventHandlers.filter((x) => x !== handler);
}

export {
  joystickWorker,
  joystickUpWorker,
  addJoystickEventHandler,
  removeJoystickEventHandler,
};
