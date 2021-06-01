let instance;

export default class MapManager {
  constructor() {
    this.maps = {};
    this.currentMapID = undefined;
  }

  registerMap(id, map) {
    this.maps[id] = map;
    if(this.currentMapID === undefined)
      this.currentMapID = id;
  }

  removeMap(id) {
    if (id in this.maps) {
      delete this.maps[id];
    }
  }

  getMap(id) {
    return this.maps[id];
  }

  setMap(id){
    this.currentMapID = id;
  }
  
  getCurrentMap(){
    return this.maps[this.currentMapID];
  }

  static getInstance() {
    if (instance === undefined) {
      instance = new MapManager();
    }
    return instance;
  }
}
