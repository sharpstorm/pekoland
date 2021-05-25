import PlayerSprite from './managers/sprite-manager.js';
import Player from './models/player.js';
import PlayerManager from './managers/player-manager.js';
import ChatManager from './managers/chat-manager.js';
import { joystickWorker, joystickUpWorker } from './workers/joystick.js';
import drawer from './managers/animation-manager.js';


let currentPlayer2 = '';


//focus
window.onload = function() {
  document.getElementById("game").focus();
};


/*
//2nd convas
var map = new Image();
//map.src = 'Images/house.jpg';
map.src = 'Images/grids.png';
var ctx = document.getElementById('game2').getContext('2d');
ctx.drawImage(map,0,0,1335,679,0,0,1000,500);
*/



//Rabbit
let down = [0,38,33];
let up = [0,116,33];
let right = [0,158,40];
let left = [0,77,40];
let rabbit = new Image();
rabbit.src = 'Images/rabbit.png';
let rabbitSprite = new PlayerSprite(up,down,right,left,rabbit);



//init bg
var map = new Image();
//map.src = 'Images/house.jpg';
map.src = 'Images/grids.png';

//Init player manager and add player TODO::hardcoded
const playerManager = PlayerManager.getInstance();
const chatManager = ChatManager.getInstance();
playerManager.addPlayer(new Player('Johnny',rabbitSprite));
playerManager.setSelf('Johnny');
//playerManager.addPlayer(new Player("Player 2",rabbitSprite));
//playerManager.addPlayer(new Player("Player 3",rabbitSprite));

playerManager.getPlayers().forEach(player => {
  player.sourceX = player.playerSprite.down[0];
  player.sourceY = player.playerSprite.down[1];
});

document.onkeydown = joystickWorker;

player2List();
window.requestAnimationFrame(() => drawer(playerManager));

// Append <button> to <body>
function player2List() {
  playerManager.getPlayers().forEach(player => {
    player.sourceX = player.playerSprite.down[0];
    player.sourceY = player.playerSprite.down[1];

    let btn = document.createElement('button');
    btn.textContent = player.name;
    btn.setAttribute('data-player-name', player.name);
    btn.onclick = (evt) => {
      let playerName = evt.target.getAttribute('data-player-name');
      document.getElementById('currPlayer2').textContent = playerName;
      currentPlayer2 = playerManager.getPlayer(playerName);
      console.log(currentPlayer2);
    }

    document.body.appendChild(btn);
  });
}


