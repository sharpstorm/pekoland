import PlayerSprite from '../../managers/sprite-manager.js';
import Player from '../../models/player.js';
import PlayerManager from '../../managers/player-manager.js';
import { joystickWorker, joystickUpWorker, addJoystickEventHandler, removeJoystickEventHandler } from '../../workers/joystick.js';
import drawer from '../../managers/animation-manager.js';
import Sprite, {AnimatableSprite, AvatarSprite} from '../../models/sprites.js';
import SpriteManager from '../../managers/sprite-manager.js';
import NetworkManager from '../network-manager.js';
import handleClientGamePacket from '../client/game-data-handler.js';
import buildClientGamePacket from '../client/game-data-sender.js';
import handleServerGamePacket from '../server/game-data-handler.js';
import buildServerGamePacket from '../server/game-data-sender.js';
import { timeout } from '../utils.js'

let networkManager = NetworkManager.getInstance();

timeout(networkManager
  .setup()
, 5000)
  .then(() => console.log('setup successful'))
  .catch(() => console.log('setup unsuccessful'));

networkManager.on('connected', () => {
  console.log('Connected to remote');
});
networkManager.on('clientConnected', (conn) => {
  console.log('Remote has connected');
});
networkManager.on('modeChanged', (mode) => {
  console.log(`Currently in ${ mode === NetworkManager.Mode.SERVER ? 'server' : 'client' } mode`);
});
networkManager.on('initialized', () => {
  if (networkManager.getOperationMode() === NetworkManager.Mode.CLIENT) {
    networkManager.initConnection().then(() => {
      networkManager.setDataHandler(handleClientGamePacket);
      console.log('connection successful');
      networkManager.send(buildClientGamePacket('handshake'));
    });
  } else {
    networkManager.setDataHandler(handleServerGamePacket);

    const playerManager = PlayerManager.getInstance();
    playerManager.addPlayer(new Player(networkManager.configStore.name, SpriteManager.getInstance().getSprite('rabbit-avatar')));
    playerManager.setSelf(networkManager.configStore.name);
  }
});

addJoystickEventHandler((evt) => {
  if (networkManager.getOperationMode() === NetworkManager.Mode.CLIENT) {
    networkManager.send(buildClientGamePacket('move', evt));
  } else {
    networkManager.send(buildServerGamePacket('move-echo', buildClientGamePacket('move', evt)));
  }
})

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
map.src = 'Images/house.jpg';

document.onkeydown = joystickWorker;

window.requestAnimationFrame(() => drawer(PlayerManager.getInstance()));
