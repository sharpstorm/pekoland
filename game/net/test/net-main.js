import PlayerSprite from '../../managers/sprite-manager.js';
import Player from '../../models/player.js';
import PlayerManager from '../../managers/player-manager.js';
import { joystickWorker, joystickUpWorker, addJoystickEventHandler, removeJoystickEventHandler } from '../../workers/joystick.js';
import drawer from '../../managers/animation-manager.js';
import NetworkManager from '../network-manager.js';
import handleGamePacket from '../game-data-handler.js';
import buildGameDataPacket from '../game-data-sender.js';
import { timeout } from '../utils.js'

let networkManager = new NetworkManager();

timeout(networkManager
  .setup()
, 5000)
  .then(() => console.log('setup successful'))
  .catch(() => console.log('setup unsuccessful'));

networkManager.on('connected', () => {
  console.log('Connected to remote');
});
networkManager.on('clientConnected', () => {
  console.log('Remote has connected');
});
networkManager.on('modeChanged', (mode) => {
  console.log(`Currently in ${ mode === NetworkManager.Mode.SERVER ? 'server' : 'client' } mode`);
});
networkManager.on('initialized', () => {
  if (networkManager.getOperationMode() === NetworkManager.Mode.CLIENT) {
    networkManager.initConnection().then(() => {
      networkManager.setDataHandler(handleGamePacket);
      console.log('connection successful')
    });
  } else {
    networkManager.setDataHandler(handleGamePacket);
  }
});

addJoystickEventHandler((evt) => {
  networkManager.send(buildGameDataPacket('movement', evt.id));
})

let currentPlayer2 = '';
//TODO. Hardcoded sprite var
let down = [0,38,33];
let up = [0,116,33];
let right = [0,158,40];
let left = [0,77,40];

//init rabbit sprite
let rabbit = new Image();
rabbit.src = 'Images/rabbit.png';
let rabbitSprite = new PlayerSprite(up,down,right,left,rabbit);

//init bg
var map = new Image();
map.src = 'Images/house.jpg';

//Init player manager and add player TODO::hardcoded
const playerManager = PlayerManager.getInstance();
playerManager.addPlayer(new Player('Johnny',rabbitSprite));
playerManager.setSelf('Johnny');
//playerManager.addPlayer(new Player("Player 2",rabbitSprite));
//playerManager.addPlayer(new Player("Player 3",rabbitSprite));

playerManager.getPlayers().forEach(player => {
  player.sourceX = player.playerSprite.down[0];
  player.sourceY = player.playerSprite.down[1];
});

document.onkeydown = joystickWorker;

window.requestAnimationFrame(() => drawer(playerManager));
