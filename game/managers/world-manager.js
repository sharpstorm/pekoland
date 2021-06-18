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
    this.waitingRoom.push(playerInfo);
    this.emitEvent(RoomController.Events.PLAYER_REQUEST_JOIN, playerInfo);
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

export default class WorldManager {
  constructor() {
    this.voiceChannelUsers = new Set();
    this.roomController = new RoomController();
    this.gameLobbies = {};
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
    this.gameLobbies[key] = {
      host,
      joiner: undefined,
      lobbyState: 0,
      gameName,
      spectators: [],
      gameState: undefined,
    };
  }

  joinLobby(key, player) {
    if (key in this.gameLobbies) {
      this.gameLobbies[key].joiner = player;
      this.gameLobbies[key].lobbyState = 1;
    }
  }

  addSpectator(key, player) {
    if (key in this.gameLobbies) {
      this.gameLobbies[key].spectators.push(player);
    }
  }

  removeSpectator(key, player) {
    if (key in this.gameLobbies) {
      if (this.gameLobbies[key].spectators.length !== 0) {
        this.gameLobbies[key].spectators.splice(this.gameLobbies[key]
          .spectators.indexOf(player), 1);
      }
    }
  }

  getSpectators(key) {
    if (key in this.gameLobbies) {
      return this.gameLobbies[key].spectators;
    }
    return undefined;
  }

  getHost(key) {
    if (key in this.gameLobbies) {
      return this.gameLobbies[key].host;
    }
    return undefined;
  }

  getJoiner(key) {
    if (key in this.gameLobbies) {
      return this.gameLobbies[key].joiner;
    }
    return undefined;
  }

  getOpponent(player) {
    const lobby = Object.values(this.gameLobbies)
      .find((x) => x.host === player || x.joiner === player);
    if (lobby !== undefined) {
      if (lobby.host === player) {
        return lobby.joiner;
      }
      if (lobby.joiner === player) {
        return lobby.host;
      }
    }
    return undefined;
  }

  closeLobby(key) {
    if (key in this.gameLobbies) {
      delete this.gameLobbies[key];
    }
  }

  getLobbyState(key) {
    if (key in this.gameLobbies) {
      return this.gameLobbies[key].lobbyState;
    }
    return undefined;
  }

  getLobbyFromPlayer(player) {
    const lobby = Object.values(this.gameLobbies)
      .find((x) => x.host === player || x.joiner === player);
    if (lobby !== undefined) {
      return lobby;
    }
    return undefined;
  }

  getLobbyGameState(key) {
    if (key in this.gameLobbies) {
      return this.gameLobbies[key].gameState;
    }
    return undefined;
  }

  getGameName(key) {
    if (key in this.gameLobbies) {
      return this.gameLobbies[key].gameName;
    }
    return undefined;
  }

  updateLobbyGameState(key, newGameState) {
    if (key in this.gameLobbies) {
      this.gameLobbies[key].gameState = newGameState;
    }
  }

  lobbyExist(key) {
    return key in this.gameLobbies;
  }

  lobbyForAll(lobbyId, action) {
    if (lobbyId in this.gameLobbies) {
      const { spectators } = this.gameLobbies[lobbyId];
      if (spectators !== undefined) {
        spectators.forEach((userId) => action(userId));
      }
      action(this.getJoiner(lobbyId));
      action(this.getHost(lobbyId));
    }
  }

  static getInstance() {
    if (instance === undefined) {
      instance = new WorldManager();
    }
    return instance;
  }
}
