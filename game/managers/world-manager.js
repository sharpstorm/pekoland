let instance;

export default class WorldManager {
  constructor() {
    this.peerIdToUidMap = {};
    this.uidToPeerIdMap = {};
    this.voiceChannelUsers = new Set();
    this.gameLobbies = {};
  }

  registerPlayer(peerId, userId) {
    this.peerIdToUidMap[peerId] = userId;
    this.uidToPeerIdMap[userId] = peerId;
  }

  removePlayer(peerId) {
    if (this.peerIdToUidMap[peerId] !== undefined) {
      const uid = this.peerIdToUidMap[peerId];
      delete this.peerIdToUidMap[peerId];
      delete this.uidToPeerIdMap[uid];
    }
  }

  getPlayerId(peerId) {
    return this.peerIdToUidMap[peerId];
  }

  getPeerId(uid) {
    return this.uidToPeerIdMap[uid];
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

  static getInstance() {
    if (instance === undefined) {
      instance = new WorldManager();
    }
    return instance;
  }
}
