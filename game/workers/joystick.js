import PlayerManager from '../managers/player-manager.js';
import Player from '../models/player.js';
import MapManager from '../managers/map-manager.js';
import Renderer from '../managers/animation-manager.js';
import GameConstants from '../game-constants.js';
import GameManager from '../managers/game-manager.js';

const playerManager = PlayerManager.getInstance();
const chatManager = GameManager.getInstance().getTextChannelManager();

let joystickEventHandlers = [];
let chatEventHandlers = [];

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

function typing(letter) {
  chatManager.textField += letter;
}

function pushMsg() {
  playerManager.getSelf().chat.speechBubbleCounter = 0;
  playerManager.getSelf().chat.speechBubble = true;
  playerManager.getSelf().chat.currentSpeech = chatManager.textField;
  chatManager.bigChatBox.push(`${playerManager.getSelf().name}: ${playerManager.getSelf().chat.currentSpeech}`);
  chatManager.textField = '';
  chatEventHandlers.forEach((x) => x({
    name: playerManager.getSelf().name,
    msg: playerManager.getSelf().chat.currentSpeech,
  }));
}

function chatWorker(e) {
  if (e.key.length === 1 && chatManager.chatting) {
    typing(e.key);
  }

  if (e.keyCode === 13 && e.altKey === true) {
    chatManager.chatting = !chatManager.chatting;
  }

  if (e.keyCode === 13 && chatManager.chatting && chatManager.textField !== '') { // nani
    pushMsg();
  }

  if (e.keyCode === 8 && chatManager.chatting) { // nani
    chatManager.textField = chatManager.textField.substring(0, chatManager.textField.length - 1);
  }

  if (e.keyCode === 67 && e.altKey === true) {
    GameManager.getInstance().getVoiceChannelManager().joinVoice();
  }

  if (e.keyCode === 68 && e.altKey === true) {
    GameManager.getInstance().getVoiceChannelManager().disconnectVoice();
  }

  if (e.keyCode === 77 && e.altKey === true && e.shiftKey !== true) {
    GameManager.getInstance().getVoiceChannelManager().activateMicrophone()
      .then(() => { console.log('successfully activated mic'); })
      .catch(() => { alert('Could not activate mic'); });
  }

  if (e.keyCode === 77 && e.altKey === true && e.shiftKey === true) {
    GameManager.getInstance().getVoiceChannelManager().disconnectMicrophone();
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

function addChatEventHandler(handler) {
  chatEventHandlers.push(handler);
}

function removeChatEventHandler(handler) {
  chatEventHandlers = chatEventHandlers.filter((x) => x !== handler);
}

export {
  joystickWorker,
  joystickUpWorker,
  addJoystickEventHandler,
  removeJoystickEventHandler,
};

export {
  addChatEventHandler,
  removeChatEventHandler,
  chatWorker,
};
