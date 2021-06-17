let instance;

export default class WorldManager {
  constructor() {
    this.peerIdToUidMap = {};
    this.voiceChannelUsers = new Set();
    this.gameLobbies = {};
  }

  registerPlayer(peerId, userId) {
    this.peerIdToUidMap[peerId] = userId;
  }

  removePlayer(peerId) {
    if (this.peerIdToUidMap[peerId] !== undefined) {
      delete this.peerIdToUidMap[peerId];
    }
  }

  getPlayerId(peerId) {
    return this.peerIdToUidMap[peerId];
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
      gameName,
      spectators: [],
      currentState: undefined,
    };
  }

  joinLobby(key, j) {
    if (key in this.gameLobbies) {
      this.gameLobbies[key].joiner = j;
    }
  }

  closeLobby(key) {
    if (key in this.gameLobbies) {
      delete this.gameLobbies[key];
    }
  }

  addSpectator(key, player) {
    if (key in this.gameLobbies) {
      if (this.gameLobbies[key].spectators.indexOf(player) < 0) {
        this.gameLobbies[key].spectators.push(player);
      }
    }
  }

  removeSpectator(key, player) {
    if (key in this.gameLobbies) {
      const idx = this.gameLobbies[key].indexOf(player);
      if (idx >= 0) {
        this.gameLobbies[key].splice(idx, 1);
      }
    }
  }

  getSpectators(key) {
    if (key in this.gameLobbies) {
      return this.gameLobbies[key].spectators;
    }
    return undefined;
  }

  getSpectatorsPlayer(player) {
    const lobby = Object.values(this.gameLobbies)
      .find((x) => x.host === player || x.joiner === player);

    if (lobby !== undefined) {
      return lobby.spectators;
    }
    return undefined;
  }

  getCurrentState(player) {
    const lobby = Object.values(this.gameLobbies)
      .find((x) => x.host === player || x.joiner === player);

    if (lobby !== undefined) {
      return lobby.currentState;
    }
    return undefined;
  }

  updateCurrentState(player, newState) {
    const lobby = Object.values(this.gameLobbies)
      .find((x) => x.host === player || x.joiner === player);

    if (lobby !== undefined) {
      lobby.currentState = newState;
    }
  }

  getLobbyPartner(key, id) {
    if (key in this.gameLobbies) {
      if (id === this.gameLobbies[key].host) {
        return this.gameLobbies[key].joiner;
      }
      return this.gameLobbies[key].host;
    }
    return undefined;
  }

  lobbyExist(key) {
    return key in this.gameLobbies;
  }

  getLobbyHost(key) {
    if (key in this.gameLobbies) {
      return this.gameLobbies[key].host;
    }
    return undefined;
  }

  getLobbyJoiner(key) {
    if (key in this.gameLobbies) {
      return this.gameLobbies[key].joiner;
    }
    return undefined;
  }

  getGameName(key) {
    if (key in this.gameLobbies) {
      return this.gameLobbies[key].gameName;
    }
    return undefined;
  }

  getGameNamePlayer(player) {
    const lobby = Object.values(this.gameLobbies)
      .find((x) => x.host === player || x.joiner === player);

    if (lobby !== undefined) {
      return lobby.gameName;
    }
    return undefined;
  }

  static getInstance() {
    if (instance === undefined) {
      instance = new WorldManager();
    }
    return instance;
  }
}
