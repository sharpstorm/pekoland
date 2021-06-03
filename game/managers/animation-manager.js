import ChatManager from './chat-manager.js';
import PlayerManager from './player-manager.js';
import MapManager from './map-manager.js';
import CameraContext from './camera-context.js'

let counter = 0;
let che = false;
let chatboxText = '';
let bigChatBox = [];
let map = new Image();
//map.src = 'Images/house.jpg';
map.src = 'Images/house1.png';

const playerManager = PlayerManager.getInstance();
const chatManager = ChatManager.getInstance();

let lastUpdate = 0;
let lastMajorUpdate = 0;
function drawer(timestamp) {
  let majorUpdate = false;
  let delta = timestamp - lastUpdate;
  if (timestamp - lastMajorUpdate > 66) {
    lastMajorUpdate = timestamp;
    majorUpdate = true;
  }

  let ctx = document.getElementById('game').getContext('2d');
  ctx.clearRect(0, 0, 1000, 500);

  CameraContext.getInstance().animate(delta);
  if(MapManager.getInstance().getCurrentMap() != undefined){
    MapManager.getInstance().getCurrentMap().draw(ctx, CameraContext.getInstance());
  }
  
  if (ChatManager.getInstance().chatting)
    drawExpandedTextBox();
  else
    drawTextBox();

  PlayerManager.getInstance().getPlayers().forEach(player => {
    player.drawAt(ctx, player.x, player.y, 50, 50,CameraContext.getInstance());
    player.animate(delta, majorUpdate);
  });

  lastUpdate = timestamp;
  window.requestAnimationFrame(drawer);
}

function drawGrids(height, width, gridLength) {
  let ctx = document.getElementById('game').getContext('2d');
  for (let i = 0; i < height; i += gridLength) {
    for (let ii = 0; ii < width; ii += gridLength) {
      ctx.beginPath();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = '1';
      ctx.rect(i, ii, gridLength, gridLength);
      ctx.stroke();
    }
  }
}

function drawTextBox(){
  ChatManager.getInstance().chatting = false;  
  let ctx = document.getElementById('game').getContext('2d');
  ctx.strokeStyle = 'white';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 1;
  ctx.font = '15px Arial';

  ctx.beginPath();
  ctx.rect(0, 485, 500, 15);
  ctx.stroke();
  ctx.fill();

  //Plus sign behind
  ctx.fillRect(485, 485, 15, 15);
  ctx.strokeStyle = 'white';
  ctx.strokeText('+', 488.5, 497.5);

  //To who
  ctx.fillRect(0, 485, 50, 15);
  ctx.font = 'normal 10px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.fillText('All', 18, 497);
}

function drawExpandedTextBox() {
  ChatManager.getInstance().chatting = true;

  const ctx = document.getElementById('game').getContext('2d');
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 1;
  ctx.font = '15px Arial';

  ctx.beginPath();
  ctx.rect(0, 485, 500, 15);
  ctx.stroke();
  ctx.fill();
  //Expand top for prev chat
  ctx.fillRect(0, 330, 500, 150);
  ctx.fillRect(0, 480, 500, 5);

  //Plus sign behind
  ctx.fillRect(485, 485, 15, 15);
  ctx.strokeStyle = 'white';
  ctx.strokeText('-', 490.5, 497);

  //To who
  ctx.fillRect(0, 485, 50, 15);
  ctx.font = 'normal 10px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.fillText('All', 18, 497);
  
  //typing words
  ctx.fillText(ChatManager.getInstance().textField, 60, 497);

  //chat history
  for (let i = 0; i < chatManager.bigChatBox.length; i++) {
    ctx.fillText(chatManager.bigChatBox[i], 5, 345 + (i * 15));
  }
  
}

export default drawer;
