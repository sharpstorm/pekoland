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
      history: [],
    };
    console.log(this.gameLobbies);
    // console.log(this.gameLobbies);
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
    const hist = this.gameLobbies[key].history;
    this.gameLobbies[key] = {
      host: h,
      joiner: j,
      gameName: gn,
      spectators: s,
      history: hist,
    };
    // console.log(this.gameLobbies);
  }

  closeLobby(key) {
    delete this.gameLobbies[key];
    console.log(this.gameLobbies);
  }

  getHistory(key) {
    return this.gameLobbies[key].history;
  }

  addHistory(player, action) {
    // eslint-disable-next-line no-restricted-syntax
    for (const entry in this.gameLobbies) {
      if (this.gameLobbies[entry].host === player || this.gameLobbies[entry].joiner === player) {
        this.gameLobbies[entry].history.push(action);
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
