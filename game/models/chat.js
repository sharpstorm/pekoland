const speechSprite = new Image();
speechSprite.src = 'Images/speech.png';

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

      ctx.drawImage(speechSprite, 0, 0, 1551, 779, x, y, 100, 50);
      ctx.font = '15px Arial';
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.fillText(this.currentSpeech, x + 20, y + 30);  //Hard coded for now
      this.speechBubbleCounter++;
    }
  }
}