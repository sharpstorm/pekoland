let instance;

export default class ChatManager {


  
  constructor() {
    this.chatting = false;
    this.self = undefined;
    this.bigChatBox = [];
  }

  getSelf() {
    return (this.self === undefined) ? undefined : this.players[this.self];
  }

  getChats(){
    return this.bigChatBox;
  }

  static getInstance() {
    if (instance === undefined) {
      instance = new ChatManager();
    }
    return instance;
  }
}