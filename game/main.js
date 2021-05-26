import PlayerSprite from './managers/sprite-manager.js';
import Player from './models/player.js';
import PlayerManager from './managers/player-manager.js';
import ChatManager from './managers/chat-manager.js';
import { joystickWorker, joystickUpWorker } from './workers/joystick.js';
import drawer from './managers/animation-manager.js';
import Sprite, {AnimatableSprite, AvatarSprite} from './models/sprites.js';
import SpriteManager from './managers/sprite-manager.js';

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
let rabbitSheet = new Image();
rabbitSheet.src = 'Images/rabbit.png';
let rabbitSprite = new AvatarSprite(
  AnimatableSprite.generateFromTiledFrames(rabbitSheet, 7, 118, 24, 36, 33, 0, 7),
  AnimatableSprite.generateFromTiledFrames(rabbitSheet, 0, 159, 36, 36, 40, 0, 7),
  AnimatableSprite.generateFromTiledFrames(rabbitSheet, 7, 38, 24, 36, 33, 0, 7),
  AnimatableSprite.generateFromTiledFrames(rabbitSheet, 0, 79, 36, 36, 40, 0, 7),
);
SpriteManager.getInstance().registerSprite('rabbit-avatar', rabbitSprite);

//init bg
var map = new Image();
//map.src = 'Images/house.jpg';
map.src = 'Images/grids.png';

//Init player manager and add player TODO::hardcoded
const playerManager = PlayerManager.getInstance();
const chatManager = ChatManager.getInstance();
playerManager.addPlayer(new Player('Johnny', SpriteManager.getInstance().getSprite('rabbit-avatar')));
playerManager.setSelf('Johnny');
//playerManager.addPlayer(new Player("Player 2",rabbitSprite));
//playerManager.addPlayer(new Player("Player 3",rabbitSprite));

document.onkeydown = joystickWorker;

//player2List();
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


