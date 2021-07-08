class FurnitureFactory {
  constructor() {
    this.furnitureTypes = {};
  }

  registerFurnitureTemplate(furniture) {
    this.furnitureTypes[furniture.id] = furniture;
  }

  getFurniture(id) {
    if (id in this.furnitureTypes) {
      return this.furnitureTypes[id];
    }
    return undefined;
  }
}

let instance;

export default class MapManager {
  constructor() {
    this.maps = {};
    this.currentMapID = undefined;
    this.furnitureFactory = new FurnitureFactory();
  }

  registerMap(id, map) {
    map.hookFurnitureFactory(this.furnitureFactory);
    map.refreshComposite();
    this.maps[id] = map;
    if (this.currentMapID === undefined) {
      this.currentMapID = id;
    }
  }

  removeMap(id) {
    if (id in this.maps) {
      this.maps[id].hookFurnitureFactory(undefined);
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

  getFurnitureFactory() {
    return this.furnitureFactory;
  }

  static getInstance() {
    if (instance === undefined) {
      instance = new MapManager();
    }
    return instance;
  }
}
