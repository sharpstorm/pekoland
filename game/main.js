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
} from './workers/joystick.js';

import Chatbox from './ui/ui-chatbox.js';
import Button, { LongButton } from './ui/ui-button.js';
import { UIAnchor } from './ui/ui-element.js';

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

const netSetupPromise = timeout(networkManager.setup(), 5000);
const assetSetupPromise = loadAssets();
Promise.all([netSetupPromise, assetSetupPromise])
  .then(() => {
    console.log('setup successful');
    document.getElementById('connecting-msg').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';

    inputSystem.addListener('keydown', joystickWorker);
    inputSystem.addListener('click', (evt) => Renderer.propagateEvent('click', evt));

    const voiceChannelManager = GameManager.getInstance().getVoiceChannelManager();
    const uiRenderer = Renderer.getUILayer();
    const playerManager = PlayerManager.getInstance();
    const chatManager = GameManager.getInstance().getTextChannelManager();

    const chatbox = new Chatbox();
    chatbox.addSubmitListener((msg) => {
      chatManager.addToHistory(playerManager.getSelf().name, msg);
      playerManager.getSelf().chat.updateMessage(msg);

      if (networkManager.getOperationMode() === NetworkManager.Mode.CLIENT) {
        networkManager.send(buildClientGamePacket('chat', { msg }));
      } else {
        networkManager.send(buildServerGamePacket('chat-echo', buildClientGamePacket('chat', { msg })));
      }
    });
    chatManager.addChangeListener(() => chatbox.update());
    uiRenderer.addElement(chatbox);

    const menuBtn = new Button(10, 10, 36, 36, new UIAnchor(false, true, true, false),
      SpriteManager.getInstance().getSprite('icon-hamburger'));

    uiRenderer.addElement(menuBtn);
    const micBtn = new Button(174, 10, 36, 36, new UIAnchor(false, true, true, false),
      SpriteManager.getInstance().getSprite('icon-mic-muted'));
    micBtn.setVisible(false);
    micBtn.addEventListener('click', () => {
      if (!voiceChannelManager.isMicConnected()) {
        GameManager.getInstance().getVoiceChannelManager().activateMicrophone()
          .then(() => { micBtn.setContent(SpriteManager.getInstance().getSprite('icon-mic')); })
          .catch(() => { alert('Could not activate mic'); });
      } else {
        voiceChannelManager.disconnectMicrophone();
        micBtn.setContent(SpriteManager.getInstance().getSprite('icon-mic-muted'));
      }
    });

    const connectBtn = new LongButton(64, 10, 100, 36, new UIAnchor(false, true, true, false), 'Connect');
    connectBtn.addEventListener('click', () => {
      if (!voiceChannelManager.isConnected()) {
        voiceChannelManager.joinVoice();
        micBtn.setVisible(true);
        connectBtn.setContent('Disconnect');
      } else {
        voiceChannelManager.disconnectVoice();
        connectBtn.setContent('Connect');
        micBtn.setVisible(false);
        micBtn.setContent(SpriteManager.getInstance().getSprite('icon-mic-muted'));
      }
    });
    uiRenderer.addElement(menuBtn);
    uiRenderer.addElement(connectBtn);
    uiRenderer.addElement(micBtn);

    Renderer.init();
    window.requestAnimationFrame(Renderer.render.bind(Renderer));
  })
  .catch((err) => {
    console.log(err);
    alert('Could not connect to partner! Please Try Again!');
    // window.close();
  });
