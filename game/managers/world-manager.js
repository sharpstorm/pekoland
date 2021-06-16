let instance;

export default class WorldManager {
  constructor() {
    this.peerIdToUidMap = {};
    this.voiceChannelUsers = new Set();
    this.gameLobbies = {};
  }

  registerLobby(key, h, gn) {
    this.gameLobbies[key] = { host: h, joiner: undefined, gameName: gn };
    console.log(this.gameLobbies);
    // console.log(this.gameLobbies);
  }

  joinLobby(key, j) {
    const h = this.gameLobbies[key].host;
    const gn = this.gameLobbies[key].gameName;
    this.gameLobbies[key] = { host: h, joiner: j, gameName: gn };
    // console.log(this.gameLobbies);
  }

  closeLobby(key) {
    delete this.gameLobbies[key];
    console.log(this.gameLobbies);
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
