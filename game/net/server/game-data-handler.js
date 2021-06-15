/* eslint-disable quote-props */

import PlayerManager from '../../managers/player-manager.js';
import SpriteManager from '../../managers/sprite-manager.js';
import WorldManager from '../../managers/world-manager.js';
import Player from '../../models/player.js';
import buildGamePacket from './game-data-sender.js';
import handleClientGamePacket from '../client/game-data-handler.js';
import NetworkManager from '../network-manager.js';
import GameManager from '../../managers/game-manager.js';
import CheckersGame from '../../games/checkers.js';

const chatManager = GameManager.getInstance().getTextChannelManager();

// const spawnLocation = [0, 0];

function handleHandshake(data, conn) {
  conn.send(buildGamePacket('handshake'));
}

function handleSpawnRequest(data, conn) {
  const { userId, name } = data;

  if (PlayerManager.getInstance().getPlayer(userId) !== undefined) {
    // Reject Connection
    conn.send(buildGamePacket('spawn-reject', 'Your account is already connected in the session!'));
    return;
  }

  const player = new Player(userId, name, SpriteManager.getInstance().getSprite('rabbit-avatar'));
  // Update connection
  conn.send(buildGamePacket('spawn-reply', {
    self: player,
    others: PlayerManager.getInstance().getPlayers(),
  }));

  // Broadcast to everyone else
  NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('spawn-player', player), conn.peer);

  // Register User to Server Player Manager and Server World Manager
  PlayerManager.getInstance().addPlayer(player);
  WorldManager.getInstance().registerPlayer(conn.peer, userId);
}

function handleMove(data, conn) {
  const player = PlayerManager.getInstance().getPlayer(data.userId);
  player.moveTo(data.x, data.y);
  player.direction = data.direction;
  NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('move-echo', data), conn.peer);
}

function handleChat(data, conn) {
  const player = PlayerManager.getInstance().getPlayer(data.userId);
  chatManager.addToHistory(player.name, data.message);
  player.chat.updateMessage(data.message);
  NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('chat-echo', data), conn.peer);
}

function handleCheckersGame(data, conn) {
  console.log(data);
  CheckersGame.getInstance().checkersMove(data);
  NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('checkers', data, conn.peer));
}

function handleJoinVoice(data, conn) {
  WorldManager.getInstance().registerVoiceChannel(conn.peer);
  conn.send(buildGamePacket('voice-channel-data', WorldManager.getInstance().getVoiceChannelUsers()));
}

function handleDisconnectVoice(data, conn) {
  WorldManager.getInstance().removeVoiceChannel(conn.peer);
  const packet = buildGamePacket('voice-channel-data', WorldManager.getInstance().getVoiceChannelUsers());

  handleClientGamePacket(packet);
  conn.send(packet);
}

// eslint-disable-next-line no-unused-vars
function handleGameLobby(data, conn) {
  console.log(data);
  // TODO REPEAT CODE
  if (data.action === 'registerLobbyRequest') {
    console.log('here???????');
    if (!WorldManager.getInstance().lobbyExist(data.tableID)) {
      WorldManager.getInstance().registerLobby(data.tableID, data.host, data.gameName);
      const newData = {
        host: data.host,
        tableID: data.tableID,
        gameName: data.gameName,
        action: 'registerLobbyEcho-success',
      };
      NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('gameLobby-echo', newData, conn.peer));
    } else {
      const newData = {
        host: data.host,
        tableID: data.tableID,
        gameName: data.gameName,
        action: 'registerLobbyEcho-fail',
      };
      NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('gameLobby-echo', newData, conn.peer));
    }
  } else if (data.action === 'checkLobby') {
    // LOBBY DOESNT EXIST
    if (!WorldManager.getInstance().lobbyExist(data.tableID)) {
      const newData = {
        host: data.host,
        tableID: data.tableID,
        gameName: data.gameName,
        action: 'open',
      };
      NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('gameLobby-echo', newData, conn.peer));
      // LOBBY EXIST, BUT WITHOUT JOINER
    } else if (WorldManager.getInstance().getLobbyJoiner(data.tableID) === undefined) {
      const newData = {
        host: data.host,
        tableID: data.tableID,
        gameName: data.gameName,
        action: 'canJoin',
      };
      console.log('here in can join');
      NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('gameLobby-echo', newData, conn.peer));
      // LOBBY EXIST, ON GOING GAME BETWEEN
    } else {
      const newData = {
        host: data.host,
        tableID: data.tableID,
        gameName: data.gameName,
        action: 'occupied',
      };
      NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('gameLobby-echo', newData, conn.peer));
    }
  }
}

const handlers = {
  'handshake': handleHandshake,
  'spawn-request': handleSpawnRequest,
  'move': handleMove,
  'chat': handleChat,
  'checkers': handleCheckersGame,
  'join-voice': handleJoinVoice,
  'disconnect-voice': handleDisconnectVoice,
  'gameLobby': handleGameLobby,
};

// Conn can be used to uniquely identify the peer
export default function handleGamePacket(data, conn) {
  if (!data.opCode) return;

  const { opCode } = data;
  if (opCode in handlers) {
    handlers[opCode](data, conn);
    return;
  }
  console.log(`[ServerHandler] Unknown Op Code: ${opCode}`);
}
