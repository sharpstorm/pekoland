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

function handleGameUpdate(data, conn) {
  // console.log(data);

  if (!data.gameName || !data.lobbyId) {
    return;
  }

  if (WorldManager.getInstance().lobbyExists(data.lobbyId)) {
    WorldManager.getInstance().updateLobbyGameState(data.lobbyId, data.state);

    const partnerUserId = WorldManager.getInstance().getPlayerId(conn.peer);
    WorldManager.getInstance().lobbyForAll(data.lobbyId, (userId) => {
      if (userId === PlayerManager.getInstance().getSelfId() || userId === partnerUserId) {
        return;
      }
      console.log(userId);
      NetworkManager.getInstance().getConnection()
        .sendTo(buildGamePacket('game-update-echo', data), WorldManager.getInstance().getPeerId(userId));
    });
    GameManager.getInstance().getBoardGameManager().getGame(data.gameName).handleNetworkEvent(data);
  }
}

function handleCheckLobbyRequest(data, conn) {
  if (!WorldManager.getInstance().lobbyExists(data.tableId)) {
    conn.send(buildGamePacket('lobby-reply', 'lobby-state-new'));
  } else {
    const lobby = WorldManager.getInstance().getLobby(data.tableId);
    if (lobby.isFull()) {
      conn.send(buildGamePacket('lobby-reply', 'lobby-state-occupied'));
    } else {
      conn.send(buildGamePacket('lobby-reply', 'lobby-state-open'));
    }
  }
}

function handleRegisterLobby(data, conn) {
  if (WorldManager.getInstance().lobbyExists(data.tableId)) {
    conn.send(buildGamePacket('lobby-reply', 'lobby-register-fail'));
  } else {
    conn.send(buildGamePacket('lobby-reply', 'lobby-register-success'));
    WorldManager.getInstance().createLobby(data.tableId, data.userId, data.gameName);
  }
}

function handleJoinLobby(data, conn) {
  if (!WorldManager.getInstance().lobbyExists(data.tableId)) {
    conn.send(buildGamePacket('lobby-reply', 'lobby-join-fail'));
  } else {
    const lobby = WorldManager.getInstance().getLobby(data.tableId);
    if (data.mode === 'player') {
      if (lobby.isFull()) {
        conn.send(buildGamePacket('lobby-reply', 'lobby-join-fail'));
        return;
      }

      WorldManager.getInstance().joinLobby(data.tableId, data.userId);
      const newData = {
        mode: data.mode,
        tableId: data.tableId,
        player1: lobby.host,
        player2: lobby.joiner,
        gameName: lobby.gameName,
      };

      // Issue Start Game to both host and joiner

      // Host can be either self or some remote
      const selfId = PlayerManager.getInstance().getSelfId();
      if (lobby.host === selfId) {
        GameManager.getInstance().getBoardGameManager().gameState = 'playing';
        GameManager.getInstance().getBoardGameManager()
          .startGame(newData.gameName, newData.player1, newData.player2, newData.tableId);
      } else {
        NetworkManager.getInstance().getConnection()
          .sendTo(buildGamePacket('start-game', newData), WorldManager.getInstance().getPeerId(lobby.host));
      }

      // Joiner must be the one sending the packet, so just reply it
      conn.send(buildGamePacket('start-game', newData));
    } else if (data.mode === 'spectator') {
      lobby.addSpectator(data.userId);
      conn.send(buildGamePacket('start-game', {
        mode: data.mode,
        tableId: data.tableId,
        player1: lobby.host,
        player2: lobby.joiner,
        gameName: lobby.gameName,
        gameState: lobby.gameState,
      }));
    }
  }
}

function handleLeaveLobby(data) {
  const worldManager = WorldManager.getInstance();
  console.log(data);
  if (worldManager.lobbyExists(data.tableId)) {
    const lobby = worldManager.getLobby(data.tableId);

    if (data.mode === 'playing') {
      // Send opponent
      const opponent = lobby.getOpponent(data.userId);
      const opponentName = PlayerManager.getInstance().getPlayer(data.userId).name;

      if (PlayerManager.getInstance().getSelfId() === opponent) {
        GameManager.getInstance().getBoardGameManager().endGame();
        alert(`${opponentName} has left the game`);
      } else {
        NetworkManager.getInstance().getConnection()
          .sendTo(buildGamePacket('end-game', opponentName),
            worldManager.getPeerId(opponent));
      }

      // Send Spectators
      lobby.spectators.forEach((userId) => {
        if (userId === PlayerManager.getInstance().getSelfId()) {
          GameManager.getInstance().getBoardGameManager().endGame();
          alert(`${opponentName} has left the game`);
        } else {
          NetworkManager.getInstance().getConnection().sendTo(
            buildGamePacket('end-game', opponentName),
            worldManager.getPeerId(userId),
          );
        }
      });

      worldManager.closeLobby(data.tableId);
    } else if (data.mode === 'spectating') {
      lobby.removeSpectator(data.userId);
    } else if (data.mode === 'hosting') {
      worldManager.closeLobby(data.tableId);
    }
  }
}

function handleChangeAvatar(data, conn) {
  const player = PlayerManager.getInstance().getPlayer(data.userId);
  if (player !== undefined) {
    player.changeSprite(data.avatarId);
    NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('change-avatar-echo', data), conn.peer);
  }
}

function handleJoinWhiteboard(data, conn) {
  const worldManager = WorldManager.getInstance();
  const playerId = worldManager.getPlayerId(conn.peer);

  const state = worldManager.registerWhiteboard(data.boardId, (userId, newState, delta) => {
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
  'change-avatar': handleChangeAvatar,
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
