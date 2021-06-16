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

import CheckersGame from './games/checkers.js';

const networkManager = NetworkManager.getInstance();
const inputSystem = new InputSystem(document.getElementById('ui-overlay'), document);

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
    const gameRenderer = Renderer.getGameLayer();
    const playerManager = PlayerManager.getInstance();
    const chatManager = GameManager.getInstance().getTextChannelManager();
    const boardGameManager = GameManager.getInstance().getBoardGameManager();

    gameRenderer.register(CheckersGame.getInstance());

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

    const gameMenu = new GameMenu(boardGameManager.gameList);
    gameMenu.cardList.forEach((card) => {
      card.addEventListener('click', () => {
        console.log(networkManager.getOperationMode()); // 1 = server, 2 = client
        if (networkManager.getOperationMode() === 2) {
          const data = {
            host: PlayerManager.getInstance().getSelfId(),
            tableID: GameManager.getInstance().getBoardGameManager().tableID,
            gameName: card.innerHTML,
            action: 'registerLobbyRequest',
          };
          NetworkManager.getInstance().send(buildClientGamePacket('gameLobby', data));
        } else if (networkManager.getOperationMode() === 1) {
          WorldManager.getInstance().registerLobby(GameManager.getInstance()
            .getBoardGameManager().tableID,
          PlayerManager.getInstance().getSelfId(), card.innerHTML);
          GameManager.getInstance().getBoardGameManager().gameState = 'hosting';
          GameManager.getInstance().getBoardGameManager().showWaitingScreen();
        }
      });
    });

    gameMenu.options.forEach((option) => {
      option.addEventListener('click', () => {
        if (option.id === 'gameJoinYes') {
          // join game
          console.log('yes yes');
          GameManager.getInstance().getBoardGameManager()
            .joinGame();
        } else if (option.id === 'gameJoinNo') {
          // close
          console.log('no no');
          if (GameManager.getInstance().getBoardGameManager() !== undefined) {
            GameManager.getInstance().getBoardGameManager().toggle();
          }
        }
      });
    });
    const gameOverlay = new GameOverlay();
    gameOverlay.leaveBtn.addEventListener('click', () => {
      GameManager.getInstance().getBoardGameManager().leaveGame();
    });

    gameMenu.spectateScreen.childNodes[0].addEventListener('click', () => {
      if (NetworkManager.getInstance().getOperationMode() === 1) {
        GameManager.getInstance().getBoardGameManager().toggle();
        GameManager.getInstance().getBoardGameManager().gameState = 'spectating';
        GameManager.getInstance().getBoardGameManager().spectateGame(
          WorldManager.getInstance()
            .getGameName(GameManager.getInstance().getBoardGameManager().tableID),
          WorldManager.getInstance()
            .getLobbyHost(GameManager.getInstance().getBoardGameManager().tableID),
          WorldManager.getInstance()
            .getLobbyJoiner(GameManager.getInstance().getBoardGameManager().tableID),
        );
        // GameManager.getInstance().getBoardGameManager().gameList[0].checkersMove

        WorldManager.getInstance().addSpectator(GameManager.getInstance()
          .getBoardGameManager().tableID, PlayerManager.getInstance().getSelfId());

        GameManager.getInstance().getBoardGameManager().toggle();
        // NO IDEA Y TOGGLE 2 times. right in spectate game
        const historyList = WorldManager.getInstance()
          .getHistory(GameManager.getInstance().getBoardGameManager().tableID);

        // TO CHANGE THIS
        setTimeout(() => {
          historyList.forEach((hist) => {
            GameManager.getInstance().getBoardGameManager()
              .gameList[0].processMove(hist); // hard coded
          });
        }, 500);

        console.log(WorldManager.getInstance().gameLobbies);
      } else if (NetworkManager.getInstance().getOperationMode() === 2) {
        GameManager.getInstance().getBoardGameManager().toggle();

        const data = {
          host: PlayerManager.getInstance().getSelfId(),
          tableID: GameManager.getInstance().getBoardGameManager().tableID,
          action: 'spectate',
        };
        NetworkManager.getInstance().send(buildClientGamePacket('gameLobby', data));
        GameManager.getInstance().getBoardGameManager().toggle();
      }
    });

    gameMenu.spectateScreen.childNodes[1].addEventListener('click', () => {
      GameManager.getInstance().getBoardGameManager().toggle();
      GameManager.getInstance().getBoardManager().gameState = undefined;
    });

    uiRenderer.addElement(gameOverlay);
    uiRenderer.addElement(gameMenu);
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
