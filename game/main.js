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
import GameMenu, { GameOverlay } from './ui/ui-game.js';
import { UIAnchor } from './ui/ui-element.js';

import CheckersGame from './games/checkers/checkers.js';
import DrawSomething from './games/draw-something/draw-something.js';
import BattleshipGame from './games/battleship/battleship.js';

import AdmissionPrompt from './ui/ui-admission-prompt.js';
import DrawerMenu from './ui/ui-drawer-menu.js';
import CustomizeWorldMenu from './ui/ui-world-customize.js';
import MapManager from './managers/map-manager.js';

const networkManager = NetworkManager.getInstance();
const inputSystem = new InputSystem(document.getElementById('ui-overlay'), document);

networkManager.on('connected', () => {
  console.log('Connected to remote');
});
networkManager.on('clientConnected', () => {
  console.log('Remote has connected');
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

function setupServerHooks() {
  const worldManager = WorldManager.getInstance();
  const roomController = worldManager.getRoomController();
  const uiRenderer = Renderer.getUILayer();

  const admissionPrompt = new AdmissionPrompt();
  uiRenderer.addElement(admissionPrompt);

  roomController.on('playerRequestJoin', (playerInfo) => {
    // eslint-disable-next-line no-restricted-globals
    admissionPrompt.prompt(`${playerInfo.name} is requesting to join. Admit?`,
      () => { roomController.admitIntoWorld(playerInfo.peerId); },
      () => { roomController.rejectAdmit(playerInfo.peerId); });
  });

  roomController.on('playerAdmit', (playerInfo) => {
    const playerId = roomController.getPlayerId(playerInfo.peerId);
    if (playerId === undefined) {
      return;
    }

    const player = new Player(playerId, playerInfo.name, SpriteManager.getInstance().getSprite('rabbit-avatar'));
    // Update connection
    NetworkManager.getInstance().getConnection().sendTo(buildServerGamePacket('spawn-reply', {
      self: player,
      others: PlayerManager.getInstance().getPlayers(),
      furniture: MapManager.getInstance().getCurrentMap().getFurnitureList(),
    }), playerInfo.peerId);

    // Broadcast to everyone else
    NetworkManager.getInstance().getConnection().sendAllExcept(buildServerGamePacket('spawn-player', player), playerInfo.peerId);

    // Register User to Server Player Manager
    PlayerManager.getInstance().addPlayer(player);
  });

  roomController.on('playerReject', (playerInfo) => {
    NetworkManager.getInstance().getConnection().sendTo(buildServerGamePacket('spawn-reject', 'Host Rejected Your Admission'), playerInfo.peerId);
  });

  // Issue World Load
  return new Promise((resolve) => {
    NetworkManager.getInstance().sendServer('furniture-get')
      .then((reply) => {
        const furnitureList = reply.data;
        if (furnitureList === undefined || furnitureList === null) {
          resolve();
          return;
        }
        MapManager.getInstance().getCurrentMap().setFurnitureToState(furnitureList);
        resolve();
      });
  });
}

networkManager.on('modeChanged', (mode) => {
  console.log(`Currently in ${mode === NetworkManager.Mode.SERVER ? 'server' : 'client'} mode`);
});

const netSetupPromise = timeout(networkManager.setup(), 5000);
const assetSetupPromise = loadAssets();
const spawnPromise = new Promise((resolve) => {
  PlayerManager.getInstance().on('spawnSelf', () => {
    PlayerManager.getInstance().on('spawnSelf', undefined);
    resolve();
  });
});
Promise.all([netSetupPromise, assetSetupPromise])
  .then(() => {
    document.getElementById('loading-panel').classList.add('joining');
    return spawnPromise;
  })
  .then(() => {
    if (networkManager.getOperationMode() === NetworkManager.Mode.SERVER) {
      return setupServerHooks();
    }
    return '';
  })
  .then(() => {
    console.log('setup successful');

    document.getElementById('loading-panel').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';

    inputSystem.addListener('keydown', joystickWorker);
    inputSystem.addListener('click', (evt) => Renderer.propagateEvent('click', evt));
    inputSystem.addListener('keydown', (evt) => Renderer.propagateEvent('keydown', evt));
    inputSystem.addListener('mousedown', (evt) => Renderer.propagateEvent('mousedown', evt));
    inputSystem.addListener('mouseup', (evt) => Renderer.propagateEvent('mouseup', evt));
    inputSystem.addListener('mousemove', (evt) => Renderer.propagateEvent('mousedown', evt));

    const voiceChannelManager = GameManager.getInstance().getVoiceChannelManager();
    const uiRenderer = Renderer.getUILayer();
    const gameRenderer = Renderer.getGameLayer();
    const playerManager = PlayerManager.getInstance();
    const chatManager = GameManager.getInstance().getTextChannelManager();
    const boardGameManager = GameManager.getInstance().getBoardGameManager();

    Renderer.getMapRenderer().registerFurnitureHandler('furniture-game-table', boardGameManager.handleEvent.bind(boardGameManager));

    const checkersGame = new CheckersGame();
    const drawSomething = new DrawSomething();
    boardGameManager.register(checkersGame);
    boardGameManager.register(drawSomething);
    gameRenderer.register(checkersGame);
    gameRenderer.register(drawSomething);

    const battleshipGame = new BattleshipGame();
    boardGameManager.register(battleshipGame);
    gameRenderer.register(battleshipGame);

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

    const customizeWorldMenu = new CustomizeWorldMenu();
    MapManager.getInstance().getFurnitureFactory().forEachType((furniture) => {
      customizeWorldMenu.addFurniture(furniture);
    });
    Renderer.getMapRenderer().registerFurnitureHandler('place', (unitX, unitY) => {
      MapManager.getInstance().getCurrentMap()
        .setFurnitureAt(unitX, unitY, customizeWorldMenu.getSelectedFurniture());
    });
    customizeWorldMenu.setSaveHandler(() => {
      Renderer.getMapRenderer().setFurniturePlacementMode(false);
      customizeWorldMenu.setVisible(false);
      const newArrangement = MapManager.getInstance().getCurrentMap().getFurnitureList();
      NetworkManager.getInstance().sendServer('furniture-save', newArrangement)
        .then(() => alert('Saved Furniture'));
      NetworkManager.getInstance().send(buildServerGamePacket('furniture-sync', newArrangement));
    });
    uiRenderer.addElement(customizeWorldMenu);

    const drawerMenu = new DrawerMenu(networkManager.getOperationMode()
      === NetworkManager.Mode.SERVER);
    // eslint-disable-next-line no-restricted-globals
    drawerMenu.setQuitHandler(() => (confirm('Are you sure you want to leave?') ? window.close() : ''));
    drawerMenu.setCustomizeWorldHandler(() => {
      Renderer.getMapRenderer().setFurniturePlacementMode(true);
      customizeWorldMenu.setVisible(true);
      drawerMenu.setVisible(false);
    });
    uiRenderer.addElement(drawerMenu);

    const menuBtn = new Button(10, 10, 36, 36, new UIAnchor(false, true, true, false),
      SpriteManager.getInstance().getSprite('icon-hamburger'));
    menuBtn.addEventListener('click', () => {
      drawerMenu.toggleVisible();
    });
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

    const gameMenu = new GameMenu(boardGameManager.gameList);
    GameManager.getInstance().getBoardGameManager().registerGameMenuUI(gameMenu);

    gameMenu.on('joinYes', () => boardGameManager.joinGame());
    gameMenu.on('joinNo', () => {
      boardGameManager.displayPage(-1);
      boardGameManager.gameState = undefined;
    });

    gameMenu.on('gamePressed', (gameName) => {
      if (networkManager.getOperationMode() === NetworkManager.Mode.CLIENT) {
        const data = {
          userId: playerManager.getSelfId(),
          tableId: boardGameManager.tableId,
          gameName,
        };
        NetworkManager.getInstance().send(buildClientGamePacket('register-lobby', data));
      } else if (networkManager.getOperationMode() === NetworkManager.Mode.SERVER) {
        WorldManager.getInstance().createLobby(boardGameManager.tableId,
          playerManager.getSelfId(), gameName);
        boardGameManager.gameState = 'hosting';
        boardGameManager.displayPage(3);
      }
    });

    gameMenu.on('spectateYes', () => boardGameManager.joinGameSpectate());
    gameMenu.on('spectateNo', () => {
      boardGameManager.displayPage(-1);
      boardGameManager.gameState = undefined;
    });

    gameMenu.on('close', () => {
      boardGameManager.closeGameMenu();
      boardGameManager.gameState = undefined;
    });

    const gameOverlay = new GameOverlay();
    GameManager.getInstance().getBoardGameManager().registerGameOverlayUI(gameOverlay);
    gameOverlay.registerLeaveListener(() => { boardGameManager.leaveGame(); });

    uiRenderer.addElement(gameMenu);
    uiRenderer.addElement(gameOverlay);
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
