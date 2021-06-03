import SpriteManager from '../managers/sprite-manager.js';

export default class Chat {
  constructor() {
    this.speechBubble = false;
    this.speechBubbleCounter = 0;
    this.currentSpeech = '';
    this.cachedSprite = undefined;
    this.cachedText = undefined;
  }

  updateMessage(m) {
    this.currentSpeech = m;
    this.speechBubbleCounter = 0;
    this.speechBubble = true;
  }

  drawAt(ctx, x, y) {
    /*
    if(this.speechBubbleCounter === 1){
        chatManager.bigChatBox.push(player.name + ": " + player.currentSpeech);
      }*/
    if (this.speechBubbleCounter > 30) {
      this.speechBubbleCounter = 0;
      this.speechBubble = false;
      this.currentSpeech = '';
      this.cachedSprite = undefined;
      this.cachedText = undefined;

    } else if (this.speechBubble) {
      if (this.cachedSprite === undefined || this.cachedText !== this.currentSpeech) {
        this.cachedSprite = document.createElement('canvas');
        let cachedCtx = this.cachedSprite.getContext('2d');
        cachedCtx.font = '15px Arial';
        cachedCtx.fillStyle = 'rgba(0, 0, 0, 1)';
        let dimens = cachedCtx.measureText(this.currentSpeech);
        SpriteManager.getInstance().getSprite('chat-bubble').drawAt(cachedCtx, 0, 0, dimens.width + 10, dimens.fontBoundingBoxAscent + dimens.fontBoundingBoxDescent + 15);
        cachedCtx.fillText(this.currentSpeech, 5, 20);
        this.cachedText = this.currentSpeech;
      }
      ctx.drawImage(this.cachedSprite, x, y);
      this.speechBubbleCounter++;
    }
  }
}