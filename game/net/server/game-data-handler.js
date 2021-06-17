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
  let newDataHost;
  let newDataJoiner;
  let newDataTableID;
  let newDataGameName;
  let newDataAction;
  const worldManager = WorldManager.getInstance();
  const boardGameManager = GameManager.getInstance().getBoardGameManager();

  if (data.action === 'registerLobbyRequest') {
    newDataHost = data.host;
    newDataTableID = data.tableID;
    newDataGameName = data.gameName;
    newDataAction = WorldManager.getInstance().lobbyExist(data.tableID) ? 'registerLobbyEcho-fail' : 'registerLobbyEcho-success';
    if (!WorldManager.getInstance().lobbyExist(data.tableID)) {
      worldManager.registerLobby(newDataTableID, newDataHost, newDataGameName);
    }
  } else if (data.action === 'joinGame') {
    console.log('join game');
    if (worldManager.lobbyExist(data.tableID)
    && worldManager.getLobbyJoiner(data.tableID) === undefined) {
      worldManager.joinLobby(data.tableID, data.joiner);
      newDataHost = WorldManager.getInstance().getLobbyHost(data.tableID);
      newDataJoiner = data.joiner;
      newDataTableID = data.tableID;
      newDataGameName = WorldManager.getInstance().getGameName(data.tableID);
      newDataAction = 'startGame';
      if (worldManager.getLobbyHost(data.tableID) === PlayerManager.getInstance().getSelfId()
        || worldManager.getLobbyJoiner(data.tableID) === PlayerManager.getInstance().getSelfId()) {
        boardGameManager.startGame(newDataGameName, newDataHost, newDataJoiner);
      }
    } else {
      newDataHost = data.host;
      newDataTableID = data.tableID;
      newDataGameName = data.gameName;
      newDataAction = 'joinGame-fail'; // TODO: UNHANDLED ON CLIENT SIDE
    }
  } else if (data.action === 'checkLobby') {
    newDataHost = data.host;
    newDataTableID = data.tableID;
    newDataGameName = data.gameName;
    if (!worldManager.lobbyExist(data.tableID)) {
      newDataAction = 'open';
    } else if (WorldManager.getInstance().getLobbyJoiner(data.tableID) === undefined) {
      newDataAction = 'canJoin';
    } else { newDataAction = 'occupied'; }
  } else if (data.action === 'closeLobby') {
    worldManager.closeLobby(data.tableID);
  } else if (data.action === 'leaveGame') {
    if (worldManager.getLobbyHost(data.tableID) === PlayerManager.getInstance().getSelfId()
    || worldManager.getLobbyJoiner(data.tableID) === PlayerManager.getInstance().getSelfId()) {
      GameManager.getInstance().getBoardGameManager().endGame();
    } else {
      newDataHost = data.host;
      newDataJoiner = WorldManager.getInstance().getLobbyPartner(data.tableID, data.host);
      newDataTableID = data.tableID;
      newDataGameName = data.gameName;
      newDataAction = 'leaveGame';
      const newData = {
        host: newDataHost,
        joiner: newDataJoiner,
        tableID: newDataTableID,
        action: newDataAction,
        gameName: newDataGameName,
      };
      NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('gameLobby-echo', newData), conn.peer);
      worldManager.closeLobby(data.tableID);
      return;
    }
    worldManager.closeLobby(data.tableID);
  } else if (data.action === 'leave-spectate') {
    worldManager.removeSpectator(data.tableID, data.host);
  } else if (data.action === 'spectate') {
    console.log(data);
    WorldManager.getInstance().addSpectator(data.tableID, data.host);
    const cb = worldManager.gameLobbies[data.tableID].currentBoard;
    console.log(cb);
    console.log(worldManager.gameLobbies);
    newDataHost = WorldManager.getInstance().getLobbyHost(data.tableID);
    newDataJoiner = WorldManager.getInstance().getLobbyJoiner(data.tableID);
    newDataGameName = WorldManager.getInstance().gameLobbies[data.tableID].gameName;
    newDataAction = { action: 'spectate-start', from: data.host, currentBoard: cb };
  } else if (data.action.newBoard !== undefined) {
    worldManager.updateCurrentBoard(data.host, data.action.newBoard);
    console.log(worldManager);
    if (boardGameManager.gameState === 'spectating') {
      const spectators = worldManager.getSpectators(boardGameManager.tableID);
      if (spectators !== undefined) {
        if (spectators.includes(PlayerManager.getInstance().getSelfId())) {
          boardGameManager.getGame(WorldManager.getGameNamePlayer(data.host))
            .updateSpectateBoard(worldManager.getCurrentBoard(data.host)); // HARD CODED 0
        }
      }
    }
    newDataAction = { action: 'spectate-update', s: worldManager.getSpectatorsPlayer(data.host), newBoard: worldManager.getCurrentBoard(data.host) };
    newDataGameName = worldManager.getGameNamePlayer(data.host);
  }
  const newData = {
    host: newDataHost,
    joiner: newDataJoiner,
    tableID: newDataTableID,
    action: newDataAction,
    gameName: newDataGameName,
  };
  console.log(newData);
  if (newData.action !== undefined) {
    NetworkManager.getInstance().getConnection().send(buildGamePacket('gameLobby-echo', newData));
    console.log(newData);
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
