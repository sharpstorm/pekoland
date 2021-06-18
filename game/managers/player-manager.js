let instance;

export default class PlayerManager {
  constructor() {
    this.players = {};
    this.self = undefined;
    this.eventHandlers = {};
  }

  addPlayer(player) {
    this.players[player.userId] = player;
  }

  setSelf(userId) {
    this.self = userId;
    this.emitEvent(PlayerManager.Events.SPAWN_SELF, this.self);
  }

  getSelf() {
    return (this.self === undefined) ? undefined : this.players[this.self];
  }

  getSelfName() {
    return this.players[this.self].name;
  }

  getSelfId() {
    return this.self;
  }

  getPlayers() {
    return Object.values(this.players);
  }

  getPlayer(userId) {
    return this.players[userId];
  }

  removePlayer(userId) {
    if (this.players[userId] !== undefined) {
      delete this.players[userId];
    }
  }

  on(evtId, handler) {
    if (Object.values(PlayerManager.Events).includes(evtId)) {
      this.eventHandlers[evtId] = handler;
    }
  }

  emitEvent(evtId, data) {
    if (evtId in this.eventHandlers) {
      this.eventHandlers[evtId](data);
    }
  }

  static getInstance() {
    if (instance === undefined) {
      instance = new PlayerManager();
    }
    return instance;
  }
}

PlayerManager.Events = {
  SPAWN_SELF: 'spawnSelf',
};
