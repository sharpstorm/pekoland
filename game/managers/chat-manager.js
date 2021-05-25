let instance;

export default class ChatManager {

  constructor() {
    this.chatting = false;
    this.self = undefined;
  }

  getSelf() {
    return (this.self === undefined) ? undefined : this.players[this.self];
  }


  

  static getInstance() {
    if (instance === undefined) {
      instance = new ChatManager();
    }
    return instance;
  }
}