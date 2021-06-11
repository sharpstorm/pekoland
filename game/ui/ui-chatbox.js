import UIElement, { UIAnchor } from './ui-element.js';
import GameManager from '../managers/game-manager.js';

const chatManager = GameManager.getInstance().getTextChannelManager();

export default class Chatbox extends UIElement {
  constructor() {
    super(0, 0, 500, 170, new UIAnchor(false, false, true, true)); // Bottom Left
    this.lastState = undefined;
  }

  // eslint-disable-next-line class-methods-use-this
  getState(camContext) {
    return {
      viewportHeight: camContext.viewportHeight,
      viewportWidth: camContext.viewportWidth,
      chatting: chatManager.chatting,
      text: chatManager.textField,
      history: chatManager.bigChatBox,
    };
  }

  isDirty(camContext) {
    const currentState = this.getState(camContext);
    return this.lastState === undefined
      || this.lastState.viewportHeight !== currentState.viewportHeight
      || this.lastState.viewportWidth !== currentState.viewportWidth
      || this.lastState.chatting !== currentState.chatting
      || this.lastState.text !== currentState.text
      || this.lastState.history.length !== currentState.history.length;
  }

  render(ctx, camContext) {
    const currentState = this.getState(camContext);

    ctx.strokeStyle = '#FFF';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.font = '15px Arial';

    ctx.beginPath();
    ctx.rect(0, currentState.viewportHeight - 20, 500, 20);
    ctx.stroke();
    ctx.fill();

    if (currentState.chatting === true) {
      // Expand top for prev chat
      ctx.fillRect(0, currentState.viewportHeight - 170, 500, 150);
    }

    // Plus sign behind
    ctx.fillRect(480, currentState.viewportHeight - 20, 20, 20);
    ctx.strokeStyle = '#FFF';
    ctx.strokeText('+', 487, currentState.viewportHeight - 3);

    // To who
    ctx.fillRect(0, currentState.viewportHeight - 20, 50, 20);
    ctx.font = 'normal 10px Arial';
    ctx.fillStyle = '#FFF';
    ctx.fillText('All', 18, currentState.viewportHeight - 5);

    if (currentState.chatting === true) {
      // typing words
      ctx.fillText(currentState.text, 60, currentState.viewportHeight - 5);

      // chat history
      for (let i = 0; i < 9; i += 1) {
        const idx = currentState.history.length - 1 - i;
        if (idx < 0) {
          break;
        }
        ctx.fillText(currentState.history[idx], 5,
          currentState.viewportHeight - 155 + ((8 - i) * 15));
      }
    }
    this.lastState = currentState;
  }
}
