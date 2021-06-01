import ChatManager from '../managers/chat-manager.js';
import PlayerManager from '../managers/player-manager.js';
import aa from '../managers/animation-manager.js';
import Player from '../models/player.js';
import CameraManager from '../managers/camera-manager.js';
import MapManager from '../managers/map-manager.js';

const playerManager = PlayerManager.getInstance();
const chatManager = ChatManager.getInstance();
const ctx = document.getElementById('game').getContext('2d');

let joystickEventHandlers = [];
let chatEventHandlers = [];

let canvas = document.createElement('canvas');
canvas.id = 'collision';
canvas.width = 1000;
canvas.height = 500;
let map = new Image();
//map.src = 'Images/house.jpg';
map.src = 'Images/house1_colli.png';


function joystickWorker(e) {
  let event = window.event ? window.event : e;

  if(event.keyCode === 37 || event.keyCode === 38 || event.keyCode === 39 || event.keyCode === 40){
    if (playerManager.getSelf().isAnimating) {
      return;
    }

    let deltaY = 0;
    let deltaX = 0;
    let direction;

    if (event.keyCode === 38) {
      deltaY = -50;
      direction = Player.Direction.UP;
    } else if (event.keyCode === 40) {
      deltaY = 50;
      direction = Player.Direction.DOWN;
    } else if (event.keyCode === 37) {
      deltaX = -50;
      direction = Player.Direction.LEFT;
    } else if (event.keyCode === 39) {
      deltaX = 50;
      direction = Player.Direction.RIGHT;
    } else {
      return;
    }

    let self = playerManager.getSelf();


  
    if (MapManager.getInstance().getCurrentMap().checkCollision(playerManager.getSelf().getGridCoord().x + deltaX / 50,  playerManager.getSelf().getGridCoord().y + deltaY / 50)){
      deltaX = 0;
      deltaY = 0;
    }

    self.direction = direction;
    if (deltaX !== 0 || deltaY !== 0) {
      /*if(CameraManager.getInstance().centering === 0)  //CENTERING PROPERTY TO BE REMOVED
        self.moveTo(self.x + deltaX, self.y + deltaY);
      else{*/
        self.isAnimating = true;
        self.currentFrame = 0;
        CameraManager.getInstance().moveCameraToGrid( CameraManager.getInstance().getCameraGridCoord().x + (deltaX / 50),  CameraManager.getInstance().getCameraGridCoord().y + (deltaY / 50));
        self.moveTo(self.x + deltaX, self.y + deltaY);
      //}
        
    }

    joystickEventHandlers.forEach(x => x({
      id: direction,
      deltaX,
      deltaY,
      x: self.x + deltaX,
      y: self.y + deltaY
    }));
  }
}

function chatWorker(e){
  if (e.key.length === 1 && ChatManager.getInstance().chatting)
  typing(e.key);

  if (e.keyCode === 13 && e.altKey === true) {  
    ChatManager.getInstance().chatting = !ChatManager.getInstance().chatting;
  }
   
  if (e.keyCode === 13 && ChatManager.getInstance().chatting && chatManager.textField != '') {  //nani
    pushMsg();
  }
  
  if (e.keyCode === 8 && ChatManager.getInstance().chatting) {  //nani
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
    name: playerManager.getSelf.name,
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
