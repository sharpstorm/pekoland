/* eslint-disable quote-props */

import PlayerManager from '../../managers/player-manager.js';
import WorldManager from '../../managers/world-manager.js';
import buildGamePacket from './game-data-sender.js';
import handleClientGamePacket from '../client/game-data-handler.js';
import NetworkManager from '../network-manager.js';
import GameManager from '../../managers/game-manager.js';

const chatManager = GameManager.getInstance().getTextChannelManager();

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

  WorldManager.getInstance().registerPlayer(conn.peer, userId);
  WorldManager.getInstance().getRoomController().addWaitingRoom(conn.peer, name);
}

function handleMove(data, conn) {
  const player = PlayerManager.getInstance().getPlayer(data.userId);
  if (player !== undefined) {
    player.moveTo(data.x, data.y);
    player.direction = data.direction;
    NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('move-echo', data), conn.peer);
  }
}

function handleChat(data, conn) {
  const player = PlayerManager.getInstance().getPlayer(data.userId);
  if (player !== undefined) {
    chatManager.addToHistory(player.name, data.message);
    player.chat.updateMessage(data.message);
    NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('chat-echo', data), conn.peer);
  }
}

function handleGameUpdate(data, conn) {
  // console.log(data);

  if (!data.gameName || !data.lobbyId) {
    return;
  }

  if (WorldManager.getInstance().lobbyExist(data.lobbyId)) {
    WorldManager.getInstance().updateLobbyGameState(data.lobbyId, data.state);

    const partnerUserId = WorldManager.getInstance().getPlayerId(conn.peer);
    WorldManager.getInstance().lobbyForAll(data.lobbyId, (userId) => {
      if (userId === PlayerManager.getInstance().getSelfId()
        || userId === partnerUserId) {
        return;
      }
      NetworkManager.getInstance().getConnection()
        .sendTo(buildGamePacket('game-update-echo', data), WorldManager.getInstance().getPeerId(userId));
    });
    GameManager.getInstance().getBoardGameManager().getGame(data.gameName).handleNetworkEvent(data);
  }
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

function handleCheckLobbyRequest(data, conn) {
  if (!WorldManager.getInstance().lobbyExist(data.tableId)) {
    conn.send(buildGamePacket('lobby-reply', 'lobby-state-new'));
  } else if (WorldManager.getInstance().getLobbyState(data.tableId) === 0) {
    conn.send(buildGamePacket('lobby-reply', 'lobby-state-open'));
  } else if (WorldManager.getInstance().getLobbyState(data.tableId) === 1) {
    conn.send(buildGamePacket('lobby-reply', 'lobby-state-occupied'));
  }
}
function handleRegisterLobby(data, conn) {
  if (WorldManager.getInstance().lobbyExist(data.tableId)) {
    conn.send(buildGamePacket('lobby-reply', 'lobby-register-fail'));
  } else {
    conn.send(buildGamePacket('lobby-reply', 'lobby-register-success'));
    WorldManager.getInstance().createLobby(data.tableId, data.userId, data.gameName);
  }
}

function handleJoinLobby(data, conn) {
  if (!WorldManager.getInstance().lobbyExist(data.tableId)) {
    conn.send(buildGamePacket('lobby-reply', 'lobby-join-fail'));
  } else if (data.mode === 'player') {
    if (WorldManager.getInstance().getJoiner(data.tableId) !== undefined) {
      conn.send(buildGamePacket('lobby-reply', 'lobby-join-fail'));
      return;
    }

    WorldManager.getInstance().joinLobby(data.tableId, data.userId);
    const newData = {
      mode: data.mode,
      tableId: data.tableId,
      player1: WorldManager.getInstance().getHost(data.tableId),
      player2: WorldManager.getInstance().getJoiner(data.tableId),
      gameName: WorldManager.getInstance().getGameName(data.tableId),
    };

    NetworkManager.getInstance().getConnection()
      .sendTo(buildGamePacket('start-game', newData), WorldManager.getInstance().getPeerId(WorldManager.getInstance().getJoiner(data.tableId)));
    NetworkManager.getInstance().getConnection()
      .sendTo(buildGamePacket('start-game', newData), WorldManager.getInstance().getPeerId(WorldManager.getInstance().getHost(data.tableId)));
    console.log(newData);
    if (newData.player1 === PlayerManager.getInstance().getSelfId()) {
      GameManager.getInstance().getBoardGameManager().gameState = 'playing';
      GameManager.getInstance().getBoardGameManager()
        .startGame(newData.gameName, newData.player1, newData.player2, newData.tableId);
    }
    console.log(WorldManager.getInstance().gameLobbies);
  } else if (data.mode === 'spectator') {
    WorldManager.getInstance().addSpectator(data.tableId, data.userId);
    conn.send(buildGamePacket('start-game', {
      mode: data.mode,
      tableId: data.tableId,
      player1: WorldManager.getInstance().getHost(data.tableId),
      player2: WorldManager.getInstance().getJoiner(data.tableId),
      gameName: WorldManager.getInstance().getGameName(data.tableId),
      gameState: WorldManager.getInstance().getLobbyGameState(data.tableId),
    }));
  }
}

function handleLeaveLobby(data) {
  console.log(WorldManager.getInstance().gameLobbies);
  if (data.mode === 'player') {
    NetworkManager.getInstance().getConnection()
      .sendTo(buildGamePacket('end-game', PlayerManager.getInstance().getSelfId()), WorldManager.getInstance().getPeerId(WorldManager.getInstance().getOpponent(data.userId)));
    const spectators = WorldManager.getInstance().getSpectators(data.tableId);
    if (spectators !== undefined) {
      spectators.forEach((userId) => {
        NetworkManager.getInstance().getConnection()
          .sendTo(buildGamePacket('end-game', PlayerManager.getInstance().getSelfId()), WorldManager.getInstance().getPeerId(userId));
      });
    }
    if (PlayerManager.getInstance().getSelfId() === WorldManager.getInstance()
      .getOpponent(data.userId)) {
      GameManager.getInstance().getBoardGameManager().endGame();
      alert(`${data.userId} has left the game`);
    }
    WorldManager.getInstance().closeLobby(data.tableId);
  } else if (data.mode === 'spectator') {
    WorldManager.getInstance().removeSpectator(data.tableId, data.userId);
  } else if (data.mode === 'hosting') {
    WorldManager.getInstance().closeLobby(data.tableId);
  }
}

function handleJoinWhiteboard(data, conn) {
  const worldManager = WorldManager.getInstance();
  const playerId = worldManager.getPlayerId(conn.peer);

  const state = worldManager.registerWhiteboard(data.boardId, (userId, newState, delta) => {
    console.log(userId, PlayerManager.getInstance().getSelfId());
    if (userId === PlayerManager.getInstance().getSelfId()) {
      GameManager.getInstance().getWhiteboardManager()
        .updateBoardState(data.boardId, newState, delta);
    } else {
      const update = { id: data.boardId };
      if (delta !== undefined) {
        update.delta = delta;
      } else {
        update.state = state;
      }
      NetworkManager.getInstance().getConnection().sendTo(buildGamePacket('whiteboard-state-echo', update), worldManager.getPeerId(userId));
    }
  });
  worldManager.addWhiteboardPlayer(data.boardId, playerId);
  if (state !== undefined) {
    conn.send(buildGamePacket('whiteboard-state-echo', {
      state,
      delta: undefined,
      id: data.boardId,
    }));
  }
}

function handleLeaveWhiteboard(data, conn) {
  const worldManager = WorldManager.getInstance();
  const playerId = worldManager.getPlayerId(conn.peer);

  worldManager.removeWhiteboardPlayer(data.boardId, playerId);
}

function handleUpdateWhiteboard(data, conn) {
  const worldManager = WorldManager.getInstance();
  const playerId = worldManager.getPlayerId(conn.peer);

  worldManager.updateWhiteboardState(data.boardId, data.state, data.delta, playerId);
}

const handlers = {
  'handshake': handleHandshake,
  'spawn-request': handleSpawnRequest,
  'move': handleMove,
  'chat': handleChat,
  'game-update': handleGameUpdate,
  'join-voice': handleJoinVoice,
  'disconnect-voice': handleDisconnectVoice,
  'check-lobby-state-request': handleCheckLobbyRequest,
  'register-lobby': handleRegisterLobby,
  'join-lobby': handleJoinLobby,
  'leave-lobby': handleLeaveLobby,
  'join-whiteboard': handleJoinWhiteboard,
  'leave-whiteboard': handleLeaveWhiteboard,
  'update-whiteboard': handleUpdateWhiteboard,
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
