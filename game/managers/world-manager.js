let instance;

export default class WorldManager {

  constructor() {
    this.peerIdToNameMap = {};
  }

  registerPlayer(peerId, name) {
    this.peerIdToNameMap[peerId] = name;
  }

  removePlayer(peerId) {
    if (this.peerIdToNameMap[peerId] !== undefined) {
      delete this.peerIdToNameMap[peerId];
    }
  }

  getPlayerName(peerId) {
    return this.peerIdToNameMap[peerId];
  }

  static getInstance() {
    if (instance === undefined) {
      instance = new WorldManager();
    }
    return instance;
  }
}