let instance;

export default class ChatManager {
  constructor() {
    this.chatting = false;
    this.self = undefined;
    this.bigChatBox = [];
    this.textField = '';
  }

  getChats() {
    return this.bigChatBox;
  }

  static getInstance() {
    if (instance === undefined) {
      instance = new ChatManager();
    }
    return instance;
  }
}
