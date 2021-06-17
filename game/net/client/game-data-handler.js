/* eslint-disable quote-props */
/* eslint-disable no-unused-vars */

import PlayerManager from '../../managers/player-manager.js';
import SpriteManager from '../../managers/sprite-manager.js';
import Player from '../../models/player.js';
import NetworkManager from '../network-manager.js';
import buildClientGamePacket from './game-data-sender.js';
import CheckersGame from '../../games/checkers.js';
import Renderer from '../../managers/animation-manager.js';
import GameManager from '../../managers/game-manager.js';
import { GameOverlay } from '../../ui/ui-game.js';

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
  player.moveTo(data.x, data.y);
  player.direction = data.direction;
}

function handleChatEcho(data, conn) {
  const player = PlayerManager.getInstance().getPlayer(data.userId);
  chatManager.addToHistory(player.name, data.message);
  player.chat.updateMessage(data.message);
}

function handleCheckersEcho(data, conn) {
  console.log(data);
  CheckersGame.getInstance().checkersMove(data);
}

function handleVoiceChannelData(data, conn) {
  const voiceUsers = data.users;
  GameManager.getInstance().getVoiceChannelManager().updateChannelUsers(voiceUsers);
}

function handleGameLobby(data, conn) {
  console.log(data);
  if (data.action === 'registerLobbyEcho-success' && data.host === PlayerManager.getInstance().getSelfId()) {
    GameManager.getInstance().getBoardGameManager().displayPage(3);
    GameManager.getInstance().getBoardGameManager().currentGame = data.gameName;
    GameManager.getInstance().getBoardGameManager().gameState = 'hosting';
  } else if (data.action === 'open' && data.host === PlayerManager.getInstance().getSelfId()) {
    GameManager.getInstance().getBoardGameManager().displayPage(0);
  } else if (data.action === 'canJoin' && GameManager.getInstance().getBoardGameManager().gameState === 'waitingCheck') {
    if (data.tableID === GameManager.getInstance().getBoardGameManager().tableID) {
      GameManager.getInstance().getBoardGameManager().displayPage(1);
    }
  } else if ((data.action === 'occupied' && GameManager.getInstance().getBoardGameManager().gameState === 'waitingCheck')) {
    GameManager.getInstance().getBoardGameManager().displayPage(2);
  } else if (data.action.action === 'spectate-start' && PlayerManager.getInstance().getSelfId() === data.action.from) {
    GameManager.getInstance().getBoardGameManager().gameState = 'spectating';
    GameManager.getInstance().getBoardGameManager().spectateGame(
      'Checkers', // hardcoded
      data.host,
      data.joiner,
    );
    // TO CHANGE THIS
    GameManager.getInstance().getBoardGameManager().getGame(data.gameName)
      .updateSpectateBoard(data.action.currentBoard); // hard coded
  } else if (data.action.action === 'spectate-update' && data.action.s.includes(PlayerManager.getInstance().getSelfId())) {
    GameManager.getInstance().getBoardGameManager().getGame(data.gameName)
      .updateSpectateBoard(data.action.newBoard);
  } else if ((data.action === 'startGame' && data.host === PlayerManager.getInstance().getSelfId())
  || (data.action === 'startGame' && data.joiner === PlayerManager.getInstance().getSelfId())) {
    GameManager.getInstance().getBoardGameManager()
      .startGame(data.gameName, data.host, data.joiner);
  } else if ((data.action === 'leaveGame' && data.host === PlayerManager.getInstance().getSelfId())
  || (data.action === 'leaveGame' && data.joiner === PlayerManager.getInstance().getSelfId())) {
    GameManager.getInstance().getBoardGameManager().endGame();
  }
}

const handlers = {
  'handshake': handleHandshake,
  'spawn-reply': handleSpawnReply,
  'spawn-reject': handleSpawnReject,
  'spawn-player': handleSpawnPlayer,
  'despawn-player': handleDespawnPlayer,
  'move-echo': handleMoveEcho,
  'chat-echo': handleChatEcho,
  'checkers': handleCheckersEcho,
  'voice-channel-data': handleVoiceChannelData,
  'game-lobby-echo': handleGameLobby,
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
