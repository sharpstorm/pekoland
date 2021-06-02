import SpriteManager from '../managers/sprite-manager.js';

export default class Chat {
  constructor() {
    this.speechBubble = false;
    this.speechBubbleCounter = 0;
    this.currentSpeech = '';
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
      //console.log('heree');
      //console.log(this.speechBubbleCounter);
      this.speechBubbleCounter = 0;
      this.speechBubble = false;
    }

    if (this.speechBubble) {
      //console.log('her');
      //console.log(this.speechBubbleCounter);
      ctx.font = '15px Arial';
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      let dimens = ctx.measureText(this.currentSpeech);
      console.log(dimens);
      SpriteManager.getInstance().getSprite('chat-bubble').drawAt(ctx, x, y, dimens.width + 10, dimens.fontBoundingBoxAscent + dimens.fontBoundingBoxDescent + 15);
      ctx.fillText(this.currentSpeech, x + 5, y + 20);  //Hard coded for now
      this.speechBubbleCounter++;
    }
  }
}