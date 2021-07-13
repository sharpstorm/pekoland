let instance;

class RoomController {
  constructor() {
    this.peerIdToUidMap = {};
    this.uidToPeerIdMap = {};
    this.waitingRoom = [];
    this.eventListeners = {};
  }

  registerPlayer(peerId, userId) {
    this.peerIdToUidMap[peerId] = userId;
    this.uidToPeerIdMap[userId] = peerId;
    this.emitEvent(RoomController.Events.PLAYER_JOIN, peerId);
  }

  removePlayer(peerId) {
    if (this.peerIdToUidMap[peerId] !== undefined) {
      const uid = this.peerIdToUidMap[peerId];
      delete this.peerIdToUidMap[peerId];
      delete this.uidToPeerIdMap[uid];

      const waitingRoomIdx = this.waitingRoom.findIndex((x) => x.peerId === peerId);
      if (waitingRoomIdx >= 0) {
        this.waitingRoom.splice(waitingRoomIdx, 1);
      }
      this.emitEvent(RoomController.Events.PLAYER_LEAVE, peerId);
    }
  }

  getPlayerId(peerId) {
    return this.peerIdToUidMap[peerId];
  }

  getPeerId(uid) {
    return this.uidToPeerIdMap[uid];
  }

  addWaitingRoom(peerId, name) {
    const playerInfo = {
      peerId,
      name,
    };

    if (peerId in this.peerIdToUidMap) {
      this.waitingRoom.push(playerInfo);
      this.emitEvent(RoomController.Events.PLAYER_REQUEST_JOIN, playerInfo);
    }
  }

  admitIntoWorld(peerId) {
    const playerIdx = this.waitingRoom.findIndex((x) => x.peerId === peerId);
    if (playerIdx < 0) {
      console.log('[RoomController] Player to Admit not Found');
    } else {
      const playerInfo = this.waitingRoom[playerIdx];
      this.waitingRoom.splice(playerIdx, 1);
      this.emitEvent(RoomController.Events.PLAYER_ADMIT, playerInfo);
    }
  }

  rejectAdmit(peerId) {
    const playerIdx = this.waitingRoom.findIndex((x) => x.peerId === peerId);
    if (playerIdx < 0) {
      console.log('[RoomController] Player to Kick not Found');
    } else {
      const playerInfo = this.waitingRoom[playerIdx];
      this.waitingRoom.splice(playerIdx, 1);
      this.emitEvent(RoomController.Events.PLAYER_REJECT, playerInfo);
    }
  }

  on(evtId, handler) {
    if (Object.values(RoomController.Events).includes(evtId)) {
      this.eventListeners[evtId] = handler;
    } else {
      console.error('[RoomController] Invalid Event ID for Listener');
    }
  }

  emitEvent(evtId, data) {
    if (evtId in this.eventListeners) {
      this.eventListeners[evtId](data);
    }
  }
}

RoomController.Events = {
  PLAYER_REQUEST_JOIN: 'playerRequestJoin',
  PLAYER_ADMIT: 'playerAdmit',
  PLAYER_REJECT: 'playerReject',
  PLAYER_JOIN: 'playerJoin',
  PLAYER_LEAVE: 'playerLeave',
};

class Lobby {
  constructor(id, host, gameName) {
    this.id = id;
    this.host = host;
    this.joiner = undefined;
    this.spectators = [];
    this.gameName = gameName;

    // States
    this.gameState = undefined;
  }

  getOpponent(playerId) {
    if (this.host === playerId) {
      return this.joiner;
    }
    if (this.joiner === playerId) {
      return this.host;
    }
    return undefined;
  }

  addSpectator(player) {
    if (this.spectators.indexOf(player) < 0) {
      this.spectators.push(player);
    }
  }

  removeSpectator(player) {
    if (this.spectators.length > 0) {
      const idx = this.spectators.indexOf(player);
      if (idx >= 0) {
        this.spectators.splice(idx, 1);
      }
    }
  }

  isFull() {
    return this.joiner !== undefined;
  }
}

export default class WorldManager {
  constructor() {
    this.voiceChannelUsers = new Set();
    this.roomController = new RoomController();
    this.gameLobbies = {};
    this.whiteboards = {};
  }

  registerPlayer(peerId, userId) {
    this.roomController.registerPlayer(peerId, userId);
  }

  removePlayer(peerId) {
    this.roomController.removePlayer(peerId);
  }

  getPlayerId(peerId) {
    return this.roomController.getPlayerId(peerId);
  }

  getPeerId(uid) {
    return this.roomController.getPeerId(uid);
  }

  getRoomController() {
    return this.roomController;
  }

  registerVoiceChannel(peerId) {
    this.voiceChannelUsers.add(peerId);
  }

  getVoiceChannelUsers() {
    return Array.from(this.voiceChannelUsers.values());
  }

  removeVoiceChannel(peerId) {
    this.voiceChannelUsers.delete(peerId);
  }

  createLobby(key, host, gameName) {
    this.gameLobbies[key] = new Lobby(key, host, gameName);
  }

  joinLobby(key, player) {
    if (key in this.gameLobbies) {
      this.gameLobbies[key].joiner = player;
      return this.gameLobbies[key];
    }
    return undefined;
  }

  closeLobby(key) {
    if (key in this.gameLobbies) {
      delete this.gameLobbies[key];
    }
  }

  isLobbyFull(key) {
    if (key in this.gameLobbies) {
      return this.gameLobbies[key].isFull();
    }
    return undefined;
  }

  getLobbyGameState(key) {
    if (key in this.gameLobbies) {
      return this.gameLobbies[key].gameState;
    }
    return undefined;
  }

  updateLobbyGameState(key, newGameState) {
    if (key in this.gameLobbies) {
      this.gameLobbies[key].gameState = newGameState;
    }
  }

  lobbyExists(key) {
    return key in this.gameLobbies;
  }

  getLobby(key) {
    return this.gameLobbies[key];
  }

  lobbyForAll(lobbyId, action) {
    if (lobbyId in this.gameLobbies) {
      const { spectators, host, joiner } = this.gameLobbies[lobbyId];
      if (spectators !== undefined) {
        spectators.forEach((userId) => action(userId));
      }
      action(host);
      if (joiner !== undefined) {
        action(joiner);
      }
    }
  }

  registerWhiteboard(boardId, notifier) {
    if (!(boardId in this.whiteboards)) {
      this.whiteboards[boardId] = {
        state: undefined,
        users: [],
        notifier,
      };
    }
    return this.whiteboards[boardId].state;
  }

  disposeWhiteboard(boardId) {
    if (boardId in this.whiteboards) {
      delete this.whiteboards[boardId];
    }
  }

  addWhiteboardPlayer(boardId, playerId) {
    console.debug(`[WorldManager] Player ${playerId} joined whiteboard`);
    const board = this.whiteboards[boardId];
    if (board !== undefined) {
      board.users.push(playerId);
      return true;
    }
    return false;
  }

  removeWhiteboardPlayer(boardId, playerId) {
    console.debug(`[WorldManager] Player ${playerId} left whiteboard`);
    const board = this.whiteboards[boardId];
    if (board !== undefined) {
      const idx = board.users.findIndex((x) => x === playerId);
      if (idx >= 0) {
        board.users.splice(idx, 1);
      }
    }
  }

  updateWhiteboardState(boardId, state, delta, sender) {
    const board = this.whiteboards[boardId];
    if (board !== undefined) {
      board.state = state;
      board.users.forEach((x) => {
        if (x !== sender) {
          board.notifier(x, state, delta);
        }
      });
    }
  }

  static getInstance() {
    if (instance === undefined) {
      instance = new WorldManager();
    }
    return instance;
  }
}
