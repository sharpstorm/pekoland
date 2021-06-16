let instance;

class RoomController {
  constructor() {
    this.peerIdToUidMap = {};
    this.waitingRoom = [];
    this.eventListeners = {};
  }

  registerPlayer(peerId, userId) {
    this.peerIdToUidMap[peerId] = userId;
    this.emitEvent(RoomController.Events.PLAYER_JOIN, peerId);
  }

  removePlayer(peerId) {
    if (this.peerIdToUidMap[peerId] !== undefined) {
      delete this.peerIdToUidMap[peerId];
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

  static getInstance() {
    if (instance === undefined) {
      instance = new WorldManager();
    }
    return instance;
  }
}
