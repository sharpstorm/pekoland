let instance;

export default class PlayerManager {
  constructor() {
    this.players = {};
    this.self = undefined;
  }

  addPlayer(player) {
    this.players[player.userId] = player;
  }

  setSelf(userId) {
    this.self = userId;
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

  static getInstance() {
    if (instance === undefined) {
      instance = new PlayerManager();
    }
    return instance;
  }
}
