let instance;

export default class PlayerManager {

  constructor() {
    this.players = {};
    this.self = undefined;
  }

  addPlayer(player) {
    this.players[player.name] = player;
  }

  setSelf(playerName) {
    this.self = playerName;
  }

  getSelf() {
    return (this.self === undefined) ? undefined : this.players[this.self];
  }

  getSelfName() {
    return this.self;
  }

  getPlayers() {
    return Object.values(this.players);
  }

  getPlayer(name) {
    return this.players[name];
  }

  static getInstance() {
    if (instance === undefined) {
      instance = new PlayerManager();
    }
    return instance;
  }
}