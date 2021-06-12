import Player from './models/player.js';

import PlayerManager from './managers/player-manager.js';
import Renderer from './managers/animation-manager.js';
import SpriteManager from './managers/sprite-manager.js';
import WorldManager from './managers/world-manager.js';
import GameManager from './managers/game-manager.js';
import NetworkManager from './net/network-manager.js';

import handleClientGamePacket from './net/client/game-data-handler.js';
import buildClientGamePacket from './net/client/game-data-sender.js';
import handleServerGamePacket from './net/server/game-data-handler.js';
import buildServerGamePacket from './net/server/game-data-sender.js';
import { timeout } from './utils.js';

import loadAssets from './workers/asset-loader.js';
import InputSystem from './workers/input-system.js';
import {
  joystickWorker,
  addJoystickEventHandler,
  addChatEventHandler,
  chatWorker,
} from './workers/joystick.js';

const networkManager = NetworkManager.getInstance();
const inputSystem = new InputSystem(document.getElementById('ui'), document);

networkManager.on('connected', () => {
  console.log('Connected to remote');
});
networkManager.on('clientConnected', () => {
  console.log('Remote has connected');
});
networkManager.on('modeChanged', (mode) => {
  console.log(`Currently in ${mode === NetworkManager.Mode.SERVER ? 'server' : 'client'} mode`);
});
networkManager.on('connectionFailed', () => {
  alert('Could not connect to partner! Please Try Again!');
  window.close();
});
networkManager.on('callStreamOpen', ({ stream, peerId }) => {
  GameManager.getInstance().getVoiceChannelManager().addOutputStream(peerId, stream);
});
networkManager.on('callEnded', (peerId) => {
  GameManager.getInstance().getVoiceChannelManager().removeOutputStream(peerId);
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
      const userId = WorldManager.getInstance().getPlayerId(peerId);
      if (userId !== undefined) {
        PlayerManager.getInstance().removePlayer(userId);
        networkManager.getConnection().sendAllExcept(buildServerGamePacket('despawn-player', userId), peerId);
      }
      WorldManager.getInstance().removeVoiceChannel(peerId);
      networkManager.getCallManager().endCall(peerId);
      networkManager.getConnection().sendAllExcept(buildServerGamePacket('voice-channel-data', WorldManager.getInstance().getVoiceChannelUsers()), peerId);
    });

    const playerManager = PlayerManager.getInstance();
    playerManager.addPlayer(new Player(networkManager.configStore.userId, networkManager.configStore.name, SpriteManager.getInstance().getSprite('rabbit-avatar')));
    playerManager.setSelf(networkManager.configStore.userId);
    Renderer.getCameraContext().centerOn(playerManager.getSelf().x, playerManager.getSelf().y);
  }
});

addJoystickEventHandler((evt) => {
  if (networkManager.getOperationMode() === NetworkManager.Mode.CLIENT) {
    networkManager.send(buildClientGamePacket('move', evt));
  } else {
    networkManager.send(buildServerGamePacket('move-echo', buildClientGamePacket('move', evt)));
  }
});

addChatEventHandler((evt) => {
  console.log(evt);
  if (networkManager.getOperationMode() === NetworkManager.Mode.CLIENT) {
    networkManager.send(buildClientGamePacket('chat', evt));
  } else {
    networkManager.send(buildServerGamePacket('chat-echo', buildClientGamePacket('chat', evt)));
  }
});

const netSetupPromise = timeout(networkManager.setup(), 5000);
const assetSetupPromise = loadAssets();
Promise.all([netSetupPromise, assetSetupPromise])
  .then(() => {
    console.log('setup successful');
    document.getElementById('connecting-msg').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';

    inputSystem.addListener('keydown', joystickWorker);
    inputSystem.addListener('keydown', chatWorker);
    inputSystem.addListener('click', (evt) => Renderer.propagateEvent('click', evt));

    Renderer.init();
    window.requestAnimationFrame(Renderer.render.bind(Renderer));
  })
  .catch((err) => {
    console.log(err);
    alert('Could not connect to partner! Please Try Again!');
    window.close();
  });
