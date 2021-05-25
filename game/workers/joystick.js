import ChatManager from '../managers/chat-manager.js';
import PlayerManager from '../managers/player-manager.js';
import aa from '../managers/animation-manager.js';

const playerManager = PlayerManager.getInstance();
const chatManager = ChatManager.getInstance();
const ctx = document.getElementById('game').getContext('2d');


  var map = new Image();
  //map.src = 'Images/house.jpg';
  map.src = 'Images/house1_colli.png';
  var canvas = document.createElement('canvas');

  canvas.id = "collision";
  canvas.width = 1000;
  canvas.height = 500;
  canvas.getContext('2d').drawImage(map,0,0,1551,779,0,0,1000,500);


function joystickWorker(e) {

  
  if(event.keyCode === 37 || event.keyCode === 38 || event.keyCode === 39 || event.keyCode === 40){
  if (playerManager.getSelf().isAnimating) {
    return;
  }

  let event = window.event ? window.event : e;
  let deltaY = 0;
  let deltaX = 0;
  let sprite = undefined;
  let action = '';

  if (event.keyCode === 38) {
    deltaY = -50;
    sprite = playerManager.getSelf().playerSprite.up;
    action = 'up';
  } else if (event.keyCode === 40) {
    deltaY = 50;
    sprite = playerManager.getSelf().playerSprite.down;
    action = 'down';
  } else if (event.keyCode === 37) {
    deltaX = -50;
    sprite = playerManager.getSelf().playerSprite.left;
    action = 'left';
  } else if (event.keyCode === 39) {
    deltaX = 50;
    sprite = playerManager.getSelf().playerSprite.right;
    action = 'right';
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


  let lala = canvas.getContext('2d').getImageData(playerManager.getSelf().x + 25 + deltaX, playerManager.getPlayer("Johnny").y + 25 + deltaY, 1, 1).data;
  if (lala[3] === 255 && lala[0] === 0 && lala[1] === 0 && lala[2] === 0) {
    console.log(ctx.getImageData(playerManager.getSelf().x + 25 + deltaX, playerManager.getPlayer("Johnny").y + 25 + deltaY, 1, 1).data);
    // Collide, no move
    deltaX = 0;
    deltaY = 0;

  }

  playerManager.getSelf().moveY = deltaY / 6;
  playerManager.getSelf().moveX = deltaX / 6;
  playerManager.getSelf().sourceX = sprite[0];
  playerManager.getSelf().sourceY = sprite[1];
  playerManager.getSelf().action = action;
  playerManager.getSelf().isAnimating = true;
  playerManager.getSelf().currentSprite = 0;

  //player2 
  //console.log("WTF");
  //console.log(currentPlayer2)
  if (event.keyCode === 87 && currentPlayer2.currentSprite > 5) {
    currentPlayer2.moveY = -50 / 6;
    currentPlayer2.currentSprite = 0;
    currentPlayer2.sourceX = currentPlayer2.playerSprite.up[0];
    currentPlayer2.sourceY = currentPlayer2.playerSprite.up[1];
    currentPlayer2.action = "up";

  }
  else if (event.keyCode === 83 && currentPlayer2.currentSprite > 5) {

    currentPlayer2.moveY = 50 / 6;
    currentPlayer2.currentSprite = 0;
    currentPlayer2.sourceX = playerManager.getArr()[0].playerSprite.down[0];
    currentPlayer2.sourceY = playerManager.getArr()[0].playerSprite.down[1];
    currentPlayer2.action = "down";

  }

  else if (event.keyCode === 65 && currentPlayer2.currentSprite > 5) {
    currentPlayer2.moveX = -50 / 6;
    currentPlayer2.currentSprite = 0;
    currentPlayer2.sourceX = playerManager.getArr()[0].playerSprite.left[0];
    currentPlayer2.sourceY = playerManager.getArr()[0].playerSprite.left[1];
    currentPlayer2.action = "left";
  }

  else if (event.keyCode === 68 && currentPlayer2.currentSprite > 5) {
    currentPlayer2.moveX = 50 / 6;
    currentPlayer2.currentSprite = 0;
    currentPlayer2.sourceX = playerManager.getArr()[0].playerSprite.right[0];
    currentPlayer2.sourceY = playerManager.getArr()[0].playerSprite.right[1];
    currentPlayer2.action = "right";

  }

}
}

function joystickUpWorker(e) {
  var event = window.event ? window.event : e;
  //if(event.keyCode == "40" || event.keyCode == "39" || event.keyCode == "38" || event.keyCode == "37" )

}

export { joystickWorker, joystickUpWorker };