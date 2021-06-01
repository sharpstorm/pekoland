import PlayerSprite from './managers/sprite-manager.js';
import Player from './models/player.js';
import PlayerManager from './managers/player-manager.js';
import { joystickWorker, joystickUpWorker, addJoystickEventHandler, removeJoystickEventHandler } from './workers/joystick.js';
import {addChatEventHandler, removeChatEventHandler, chatWorker} from './workers/joystick.js';
import drawer from './managers/animation-manager.js';
import Sprite, {AnimatableSprite, AvatarSprite} from './models/sprites.js';
import SpriteManager from './managers/sprite-manager.js';
import NetworkManager from './net/network-manager.js';
import handleClientGamePacket from './net/client/game-data-handler.js';
import buildClientGamePacket from './net/client/game-data-sender.js';
import handleServerGamePacket from './net/server/game-data-handler.js';
import buildServerGamePacket from './net/server/game-data-sender.js';
import { timeout } from './net/utils.js'
import WorldManager from './managers/world-manager.js';

let networkManager = NetworkManager.getInstance();

timeout(networkManager
  .setup()
, 5000)
  .then(() => {
    document.getElementById('connecting-msg').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    console.log('setup successful');
  })
  .catch(() => {
    alert('Could not connect to partner! Please Try Again!');
    window.close();
  });

networkManager.on('connected', () => {
  console.log('Connected to remote');
});
networkManager.on('clientConnected', (conn) => {
  console.log('Remote has connected');
});
networkManager.on('modeChanged', (mode) => {
  console.log(`Currently in ${ mode === NetworkManager.Mode.SERVER ? 'server' : 'client' } mode`);
});
networkManager.on('connectionFailed', () => {
  alert('Could not connect to partner! Please Try Again!');
  window.close();
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
    networkManager.addCleanupHandler((peerId) => {
      let userId = WorldManager.getInstance().getPlayerId(peerId);
      if (userId !== undefined) {
        PlayerManager.getInstance().removePlayer(userId);
        networkManager.getConnection().sendAllExcept(buildServerGamePacket('despawn-player', userId), peerId);
      }
    });

    const playerManager = PlayerManager.getInstance();
    playerManager.addPlayer(new Player(networkManager.configStore.userId, networkManager.configStore.name, SpriteManager.getInstance().getSprite('rabbit-avatar')));
    playerManager.setSelf(networkManager.configStore.userId);
  }
});

addJoystickEventHandler((evt) => {
  if (networkManager.getOperationMode() === NetworkManager.Mode.CLIENT) {
    networkManager.send(buildClientGamePacket('move', evt));
  } else {
    networkManager.send(buildServerGamePacket('move-echo', buildClientGamePacket('move', evt)));
  }
})

addChatEventHandler((evt) => {
  console.log(evt);
  if (networkManager.getOperationMode() === NetworkManager.Mode.CLIENT) {
    networkManager.send(buildClientGamePacket('chat', evt));
  } else {
    networkManager.send(buildServerGamePacket('chat-echo', buildClientGamePacket('chat', evt)));
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

document.addEventListener('keydown',joystickWorker);
document.addEventListener('keydown',chatWorker);

window.requestAnimationFrame(() => drawer(PlayerManager.getInstance()));
