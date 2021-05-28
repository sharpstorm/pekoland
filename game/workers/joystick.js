import ChatManager from '../managers/chat-manager.js';
import PlayerManager from '../managers/player-manager.js';
import aa from '../managers/animation-manager.js';
import Player from '../models/player.js';

const playerManager = PlayerManager.getInstance();
const chatManager = ChatManager.getInstance();
const ctx = document.getElementById('game').getContext('2d');
let joystickEventHandlers = [];


  var map = new Image();
  //map.src = 'Images/house.jpg';
  map.src = 'Images/house1_colli.png';
  var canvas = document.createElement('canvas');

  canvas.id = "collision";
  canvas.width = 1000;
  canvas.height = 500;
  canvas.getContext('2d').drawImage(map,0,0,1551,779,0,0,1000,500);


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

  // Collision Detection

  //BUT IN JOYSTICK FOR NOW
  var map = new Image();
  //map.src = 'Images/house.jpg';
  map.src = 'Images/house1_colli.png';
  var canvas = document.createElement('canvas');

  canvas.id = "collision";
  canvas.width = 1000;
  canvas.height = 500;
  canvas.getContext('2d').drawImage(map,0,0,1551,779,0,0,1000,500);


  let lala = canvas.getContext('2d').getImageData(playerManager.getSelf().x + 25 + deltaX, playerManager.getSelf().y + 25 + deltaY, 1, 1).data;
  if (lala[3] === 255 && lala[0] === 0 && lala[1] === 0 && lala[2] === 0) {
    console.log(ctx.getImageData(playerManager.getSelf().x + 25 + deltaX, playerManager.getSelf().y + 25 + deltaY, 1, 1).data);
    // Collide, no move
    deltaX = 0;
    deltaY = 0;

  }

  playerManager.getSelf().moveY = deltaY / 6;
  playerManager.getSelf().moveX = deltaX / 6;
  playerManager.getSelf().direction = direction;
  playerManager.getSelf().isAnimating = true;
  playerManager.getSelf().currentFrame = 0;

  joystickEventHandlers.forEach(x => x({
    id: direction,
    deltaX,
    deltaY
  }));

}
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

export { joystickWorker, joystickUpWorker, addJoystickEventHandler, removeJoystickEventHandler };