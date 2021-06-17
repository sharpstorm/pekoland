let instance;

export default class WorldManager {
  constructor() {
    this.peerIdToUidMap = {};
    this.voiceChannelUsers = new Set();
    this.gameLobbies = {};
  }

  registerLobby(key, h, gn) {
    this.gameLobbies[key] = {
      host: h,
      joiner: undefined,
      gameName: gn,
      spectators: [],
      currentBoard: undefined,
    };
  }

  addSpectator(key, player) {
    this.gameLobbies[key].spectators.push(player);
  }

  removeSpectator(key, player) {
    this.gameLobbies[key].spectators.pop(player);
  }

  joinLobby(key, j) {
    const h = this.gameLobbies[key].host;
    const gn = this.gameLobbies[key].gameName;
    const s = this.gameLobbies[key].spectators;
    const cb = this.gameLobbies[key].currentBoard;
    this.gameLobbies[key] = {
      host: h,
      joiner: j,
      gameName: gn,
      spectators: s,
      currentBoard: cb,
    };
  }

  closeLobby(key) {
    delete this.gameLobbies[key];
  }

  getCurrentBoard(player) {
    // eslint-disable-next-line no-restricted-syntax
    for (const entry in this.gameLobbies) {
      if (this.gameLobbies[entry].host === player || this.gameLobbies[entry].joiner === player) {
        return this.gameLobbies[entry].currentBoard;
      }
    }
    return undefined;
  }

  updateCurrentBoard(player, newBoard) {
    console.log(newBoard);
    console.log(player);
    // eslint-disable-next-line no-restricted-syntax
    for (const entry in this.gameLobbies) {
      if (this.gameLobbies[entry].host === player || this.gameLobbies[entry].joiner === player) {
        if (player === this.gameLobbies[entry].joiner) {
          // eslint-disable-next-line no-nested-ternary
          const mm = newBoard.map((x) => (x !== 0 ? (x === 1 ? 2 : 1) : 0));
          this.gameLobbies[entry].currentBoard = mm.reverse();
        } else {
          this.gameLobbies[entry].currentBoard = newBoard;
        }
      }
    }
  }

  getSpectators(key) {
    // eslint-disable-next-line no-restricted-syntax
    return this.gameLobbies[key].spectators;
  }

  getSpectatorsPlayer(player) {
    // eslint-disable-next-line no-restricted-syntax
    for (const entry in this.gameLobbies) {
      if (this.gameLobbies[entry].host === player || this.gameLobbies[entry].joiner === player) {
        return this.gameLobbies[entry].spectators;
      }
    }
    return undefined;
  }

  getLobbyPartner(key, id) {
    if (id === this.gameLobbies[key].host) {
      return this.gameLobbies[key].joiner;
    }
    return this.gameLobbies[key].host;
  }

  lobbyExist(key) {
    console.log(this.gameLobbies);
    return (this.gameLobbies[key]) !== undefined;
  }

  getLobbyHost(key) {
    return this.gameLobbies[key].host;
  }

  getLobbyJoiner(key) {
    return this.gameLobbies[key].joiner;
  }

  getGameName(key) {
    return this.gameLobbies[key].gameName;
  }

  getGameNamePlayer(player) {
    // eslint-disable-next-line no-restricted-syntax
    for (const entry in this.gameLobbies) {
      if (this.gameLobbies[entry].host === player || this.gameLobbies[entry].joiner === player) {
        return this.gameLobbies[entry].gameName;
      }
    }
    return undefined;
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

  static getInstance() {
    if (instance === undefined) {
      instance = new WorldManager();
    }
    return instance;
  }
}
