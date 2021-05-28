export default class Chat {
    constructor(name) {
        this.speechBubble = false;
        this.speechBubbleCounter = 0;
        this.currentSpeech = '';
        this.speech = new Image();
        this.speech.src = 'Images/speech.png'
    }

    updateMessage(m){
        this.currentSpeech = m;
        this.speechBubbleCounter = 0;
        this.speechBubble = true;
    }
  

    drawAt(ctx,x, y){
        /*
        if(this.speechBubbleCounter === 1){
            chatManager.bigChatBox.push(player.name + ": " + player.currentSpeech);
          }*/
        if(this.speechBubbleCounter > 30){
            //console.log('heree');
            //console.log(this.speechBubbleCounter);
            this.speechBubbleCounter = 0;
            this.speechBubble = false;
        }
        
        if(this.speechBubble){
            //console.log('her');
            //console.log(this.speechBubbleCounter);
           
            ctx.drawImage(this.speech,0,0,1551,779,x,y,100,50);
            ctx.font = '15px Arial';
            ctx.fillStyle = "rgba(0, 0, 0, 1)";
            ctx.fillText(this.currentSpeech, x + 20, y + 30);  //Hard coded for now
            this.speechBubbleCounter++;
            
        }
    }
}