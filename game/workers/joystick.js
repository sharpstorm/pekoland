import ChatManager from '../managers/chat-manager.js';
import PlayerManager from '../managers/player-manager.js';
import aa from '../managers/animation-manager.js';
import Player from '../models/player.js';

const playerManager = PlayerManager.getInstance();
const chatManager = ChatManager.getInstance();
const ctx = document.getElementById('game').getContext('2d');

let joystickEventHandlers = [];
let chatEventHandlers = [];


 
  var canvas = document.createElement('canvas');
  canvas.id = 'collision';
  canvas.width = 1000;
  canvas.height = 500;
  let map = new Image();
  //map.src = 'Images/house.jpg';
  map.src = 'Images/house1_colli.png';
  
  map.onload = () => {
    canvas.getContext('2d').drawImage(map,0,0,1551,779,0,0,1000,500);
  }

function joystickWorker(e) {
  let event = window.event ? window.event : e;

  if(event.keyCode === 37 || event.keyCode === 38 || event.keyCode === 39 || event.keyCode === 40){
  if (playerManager.getSelf().isAnimating) {
    return;
  }

  let deltaY = 0;
  let deltaX = 0;
  let sprite = undefined;
  let direction;

  if (event.keyCode === 38) {
    deltaY = -50;
    playerManager.getSelf().updateY(playerManager.getSelf().y + deltaY);
    direction = Player.Direction.UP;
  } else if (event.keyCode === 40) {
    deltaY = 50;
    playerManager.getSelf().updateY(playerManager.getSelf().y + deltaY);
    direction = Player.Direction.DOWN;
  } else if (event.keyCode === 37) {
    deltaX = -50;
    playerManager.getSelf().updateX(playerManager.getSelf().x + deltaX);
    direction = Player.Direction.LEFT;
  } else if (event.keyCode === 39) {
    deltaX = 50;
    playerManager.getSelf().updateX(playerManager.getSelf().x + deltaX);
    direction = Player.Direction.RIGHT;
  } else {
    return;
  }

  // Collision Detection

  //BUT IN JOYSTICK FOR NOW
  //canvas.getContext('2d').drawImage(map,0,0,1551,779,0,0,1000,500);
  playerManager.getSelf().isAnimating = true;

  let lala = canvas.getContext('2d').getImageData(playerManager.getSelf().x + 25 + deltaX, playerManager.getSelf().y + 25 + deltaY, 1, 1).data;
  if (lala[3] === 255 && lala[0] === 0 && lala[1] === 0 && lala[2] === 0) {
    console.log(ctx.getImageData(playerManager.getSelf().x + 25 + deltaX, playerManager.getSelf().y + 25 + deltaY, 1, 1).data);
    // Collide, no move
    playerManager.getSelf().isAnimating = false;
    playerManager.getSelf().newX = playerManager.getSelf().oldX;
    playerManager.getSelf().newY = playerManager.getSelf().oldY;
    deltaX = 0;
    deltaY = 0;
    
  }


  playerManager.getSelf().direction = direction;
  
  playerManager.getSelf().currentFrame = 0;

  joystickEventHandlers.forEach(x => x({
    id: direction,
    deltaX,
    deltaY
  }));

}
}

function chatWorker(e){
 
  if(e.key.length === 1 && ChatManager.getInstance().chatting)
  typing(e.key);

  if(e.keyCode === 13 && e.altKey === true){  
    ChatManager.getInstance().chatting = !ChatManager.getInstance().chatting;
  }
   
  if(e.keyCode === 13 && ChatManager.getInstance().chatting && chatManager.textField != ''){  //nani
    pushMsg();
  }
  
  if(e.keyCode === 8 && ChatManager.getInstance().chatting){  //nani
    chatManager.textField = chatManager.textField.substring(0, chatManager.textField.length - 1)
  }
}

function typing(letter){
  chatManager.textField += letter;
}

function pushMsg(){
  playerManager.getSelf().chat.speechBubbleCounter  = 0;
  playerManager.getSelf().chat.speechBubble = true;
  playerManager.getSelf().chat.currentSpeech = ChatManager.getInstance().textField;
  chatManager.bigChatBox.push(playerManager.getSelf().name + ": " + playerManager.getSelf().chat.currentSpeech);
  chatManager.textField = '';
  chatEventHandlers.forEach(x => x({
    msg: playerManager.getSelf().chat.currentSpeech,
  }));
}


function joystickUpWorker(e) {
  var event = window.event ? window.event : e;
  //if(event.keyCode == "40" || event.keyCode == "39" || event.keyCode == "38" || event.keyCode == "37" )

}

function addJoystickEventHandler(handler) {
  joystickEventHandlers.push(handler);
}

function removeJoystickEventHandler(handler) {
  joystickEventHandlers = joystickEventHandlers.filter(x => x !== handler);
}

function addChatEventHandler(handler) {
  chatEventHandlers.push(handler);
}

function removeChatEventHandler(handler) {
  chatEventHandlers = chatEventHandlers.filter(x => x !== handler);
}


export {joystickWorker, joystickUpWorker, addJoystickEventHandler, removeJoystickEventHandler};
export {addChatEventHandler, removeChatEventHandler, chatWorker};
