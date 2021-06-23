let instance;

export default class MapManager {
  constructor() {
    this.maps = {};
    this.currentMapID = undefined;
  }

  registerMap(id, map) {
    this.maps[id] = map;
    if (this.currentMapID === undefined) {
      this.currentMapID = id;
    }
  }

  removeMap(id) {
    if (id in this.maps) {
      delete this.maps[id];
    }
    if (id === this.currentMapID) {
      const remaining = Object.keys(this.maps);
      if (remaining.length > 0) {
        [this.currentMapID] = remaining;
      } else {
        this.currentMapID = undefined;
      }
    }
  }

  getMap(id) {
    return this.maps[id];
  }

  setMap(id) {
    if (id in this.maps) {
      this.currentMapID = id;
    }
  }

  getCurrentMap() {
    return this.maps[this.currentMapID];
  }

  static getInstance() {
    if (instance === undefined) {
      instance = new MapManager();
    }
    return instance;
  }
}
