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
    if (this.speechBubbleCounter > 30) {
      this.speechBubbleCounter = 0;
      this.speechBubble = false;
    }

    if (this.speechBubble) {
      ctx.drawImage(speechSprite, 0, 0, 1551, 779, x, y, 100, 50);
      ctx.font = '15px Arial';
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.fillText(this.currentSpeech, x + 20, y + 30);  //Hard coded for now
      this.speechBubbleCounter++;
    }
  }
}