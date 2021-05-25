import ChatManager from './chat-manager.js';
import PlayerManager from './player-manager.js';

let counter = 0;
let che = false;
let chatboxText = '';
let bigChatBox = [];

function drawer() {
  if (counter > 4) {
    var ctx = document.getElementById('game').getContext('2d');
    ctx.clearRect(0, 0, 1000, 500);
    drawGrids(1000, 500, 50);
    if(che)
      drawExanpadedTextBox();
    else
      drawTextBox();
    PlayerManager.getInstance().getPlayers().forEach(player => {
      // Nametag
      ctx.strokeStyle = 'black';
      ctx.font = '10px Arial';
      ctx.strokeText(player.name, player.x, player.y);
      ctx.drawImage(player.playerSprite.image, player.sourceX, player.sourceY, 37.5, 40, player.x, player.y, 50, 50);

      player.animate();
    });
    counter = 0;  //FPS
  }
  counter++;
  window.requestAnimationFrame(drawer);
}

function drawGrids(height, width, gridLength) {
  var ctx = document.getElementById('game').getContext('2d');
  for (let i = 0; i < height; i += gridLength) {
    for (let ii = 0; ii < width; ii += gridLength) {
      ctx.beginPath();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = '1';
      ctx.rect(i, ii, gridLength, gridLength);
      ctx.stroke();
    }
  }
}

function draggable() {
  console.log(getPixel())
}

function getPixel(x, y) {
  var ctx = document.getElementById('game').getContext('2d');
  return context.getImageData(x, y, 1, 1).data;
}


function drawTextBox(){
  che = false;  
  var ctx = document.getElementById('game').getContext('2d');
  ctx.beginPath();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = '1';
  ctx.rect(0, 485, 500, 15);
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 485, 500, 15);
  ctx.stroke();

  //Plus sign behind
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(485, 485, 15, 15);
  ctx.font = '15px Arial';
  ctx.strokeStyle = 'white';
  ctx.strokeText("+", 488.5, 497.5);

  //To who
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 485, 50, 15);
  ctx.font = 'normal 10px Arial';
  ctx.strokeStyle = 'white';
  ctx.fillStyle = "rgba(255, 255, 255, 1)";
  ctx.fillText("All", 18, 497);

  

}




function drawExanpadedTextBox(){
  che = true;
  var ctx = document.getElementById('game').getContext('2d');
  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = '1';
  ctx.rect(0, 485, 500, 15);
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 485, 500, 15);
  ctx.stroke();

  //Plus sign behind
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(485, 485, 15, 15);
  ctx.font = '15px Arial';
  ctx.strokeStyle = 'white';
  ctx.strokeText("-", 490.5, 497);

  //To who
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 485, 50, 15);
  ctx.font = 'normal 10px Arial';
  ctx.strokeStyle = 'white';
  ctx.fillStyle = "rgba(255, 255, 255, 1)";
  ctx.fillText("All", 18, 497);

  //Expand top for prev chat
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 330, 500, 150);


  ctx.fillRect(0, 480, 500, 5);
  
  //typing words
  ctx.font = 'normal 10px Arial';
  ctx.fillStyle = "rgba(255, 255, 255, 1)";
  ctx.fillText(chatboxText, 60, 497);

  //chat history
  var i;
  for(i=0;i<bigChatBox.length;i++){
    ctx.font = 'normal 10px Arial';
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.fillText(bigChatBox[i], 5, 345 + (i * 15));
  }
  
  
  //flickering line
  

 
  
}


function typing(letter){
  chatboxText += letter;
}

const playerManager = PlayerManager.getInstance();

function pushMsg(){
  bigChatBox.push(playerManager.getSelf().name + ": " + chatboxText);
  chatboxText = '';
}
var ctx = document.getElementById('game');
ctx.addEventListener('click', function(e) {
  //console.log(e);
  if(e.screenX <= 682 && e.screenX >= 663 && e.screenY <= 793 && e.screenY >= 773 ){
    che = !che;
    ChatManager.getInstance().chatting = !ChatManager.getInstance().chatting;
  }
}, false);

ctx.addEventListener('keydown', function(e) {
  if(e.key.length === 1 && ChatManager.getInstance().chatting)
  typing(e.key);
  if(e.keyCode === 13 && ChatManager.getInstance().chatting){  //nani
    pushMsg();
  }
  
  if(e.keyCode === 8 && ChatManager.getInstance().chatting){  //nani
    chatboxText = chatboxText.substring(0, chatboxText.length - 1)
  }
  
  
}, false);

export default drawer;