let instance = undefined;

export default class GameManager {
  constructor() {

  }

  static getInstance() {
    if (instance === undefined) {
      instance = new GameManager();
    }
    return instance;
  }
}