/* eslint-disable quote-props */
/* eslint-disable no-unused-vars */

import PlayerManager from '../../managers/player-manager.js';
import SpriteManager from '../../managers/sprite-manager.js';
import Player from '../../models/player.js';
import NetworkManager from '../network-manager.js';
import buildClientGamePacket from './game-data-sender.js';
import Renderer from '../../managers/animation-manager.js';
import GameManager from '../../managers/game-manager.js';
import { GameOverlay } from '../../ui/ui-game.js';
import MapManager from '../../managers/map-manager.js';

const chatManager = GameManager.getInstance().getTextChannelManager();

function inflatePlayer(data) {
  const player = new Player(data.userId, data.name, SpriteManager.getInstance().getSprite('rabbit-avatar'));
  player.x = data.x;
  player.y = data.y;
  player.direction = data.direction;
  return player;
}

function handleHandshake(data, conn) {
  conn.send(buildClientGamePacket('spawn-request', {
    name: NetworkManager.getInstance().configStore.name,
    userId: NetworkManager.getInstance().configStore.userId,
  }));
}

function handleSpawnReply(data, conn) {
  const self = inflatePlayer(data.self);
  PlayerManager.getInstance().addPlayer(self);
  PlayerManager.getInstance().setSelf(self.userId);
  Renderer.getCameraContext().centerOn(self.x, self.y);
  data.others.forEach((x) => {
    PlayerManager.getInstance().addPlayer(inflatePlayer(x));
  });
  MapManager.getInstance().getCurrentMap().setFurnitureToState(data.furniture);
}

function handleSpawnReject(data, conn) {
  alert(data.msg);
  window.close();
}

function handleSpawnPlayer(data, conn) {
  PlayerManager.getInstance().addPlayer(inflatePlayer(data.player));
}

function handleDespawnPlayer(data, conn) {
  PlayerManager.getInstance().removePlayer(data.userId);
}

function handleMoveEcho(data, conn) {
  const player = PlayerManager.getInstance().getPlayer(data.userId);
  if (player !== undefined) {
    player.moveTo(data.x, data.y);
    player.direction = data.direction;
  }
}

function handleChatEcho(data, conn) {
  const player = PlayerManager.getInstance().getPlayer(data.userId);
  if (player !== undefined) {
    chatManager.addToHistory(player.name, data.message);
    player.chat.updateMessage(data.message);
  }
}

function handleGameUpdateEcho(data, conn) {
  if (!data.gameName) {
    return;
  }

  GameManager.getInstance().getBoardGameManager().getGame(data.gameName).handleNetworkEvent(data);
}

function handleVoiceChannelData(data, conn) {
  const voiceUsers = data.users;
  GameManager.getInstance().getVoiceChannelManager().updateChannelUsers(voiceUsers);
}

function handleLobbyReply(data, conn) {
  const boardGameManager = GameManager.getInstance().getBoardGameManager();
  if (data.msg === 'lobby-state-new'
    || data.msg === 'lobby-state-open'
    || data.msg === 'lobby-state-occupied') {
    let page = 0;
    if (data.msg === 'lobby-state-open') {
      page = 1;
    } else if (data.msg === 'lobby-state-occupied') {
      page = 2;
    }
    boardGameManager.displayPage(page);
    boardGameManager.setGameState('selecting');
  } else if (data.msg === 'lobby-register-fail') {
    alert('Failed to create lobby');
  } else if (data.msg === 'lobby-register-success') {
    boardGameManager.displayPage(3);
    boardGameManager.setGameState('hosting');
  } else if (data.msg === 'lobby-join-fail') {
    alert('Failed to join lobby');
  }
}

function handleStartGame(data, conn) {
  if (data.mode === 'player') {
    GameManager.getInstance().getBoardGameManager()
      .startGame(data.gameName, data.player1, data.player2, data.tableId);
  } else if (data.mode === 'spectator') {
    GameManager.getInstance().getBoardGameManager()
      .spectateGame(data.gameName, data.player1, data.player2, data.tableId, data.gameState);
  }
}

function handleEndGame(data, conn) {
  GameManager.getInstance().getBoardGameManager().endGame();
  alert(`${data.msg} has left the game`);
}

function handleFurnitureSync(data) {
  MapManager.getInstance().getCurrentMap().setFurnitureToState(data.furniture);
}

function handleWhiteboardEcho(data) {
  GameManager.getInstance().getWhiteboardManager()
    .updateBoardState(data.boardId, data.state, data.delta);
}

const handlers = {
  'handshake': handleHandshake,
  'spawn-reply': handleSpawnReply,
  'spawn-reject': handleSpawnReject,
  'spawn-player': handleSpawnPlayer,
  'despawn-player': handleDespawnPlayer,
  'move-echo': handleMoveEcho,
  'chat-echo': handleChatEcho,
  'game-update-echo': handleGameUpdateEcho,
  'voice-channel-data': handleVoiceChannelData,
  'lobby-reply': handleLobbyReply,
  'start-game': handleStartGame,
  'end-game': handleEndGame,
  'furniture-sync': handleFurnitureSync,
  'whiteboard-state-echo': handleWhiteboardEcho,
};

// Conn will always be the server
export default function handleGamePacket(data, conn) {
  if (!data.opCode) return;

  const { opCode } = data;
  if (opCode in handlers) {
    handlers[opCode](data, conn);
    return;
  }
  console.log(`[ClientHandler] Unknown Op Code: ${opCode}`);
}
