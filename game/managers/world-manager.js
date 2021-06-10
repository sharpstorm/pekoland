let instance;

export default class WorldManager {
  constructor() {
    this.peerIdToUidMap = {};
    this.voiceChannelUsers = new Set();
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
