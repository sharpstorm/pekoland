import WorldManager from './world-manager.js';
import NetworkManager from '../net/network-manager.js';
import buildClientGamePacket from '../net/client/game-data-sender.js';
import buildServerGamePacket from '../net/server/game-data-sender.js';
import { timeout } from '../utils.js';

// import Player from '../models/player.js';
import PlayerManager from './player-manager.js';
// import PlayerManager from './player-manager.js';

let instance;

class VoiceChannelManager {
  constructor() {
    this.connected = false;
    this.microphoneStream = undefined;
    this.outputObjects = {};
  }

  joinVoice() {
    if (this.connected) {
      return;
    }

    const networkManager = NetworkManager.getInstance();
    if (networkManager.getOperationMode() === NetworkManager.Mode.CLIENT) {
      networkManager.send(buildClientGamePacket('join-voice'));
    } else {
      WorldManager.getInstance().registerVoiceChannel(networkManager.getSelfPeerId());
      this.updateChannelUsers(WorldManager.getInstance().getVoiceChannelUsers());
    }
    this.connected = true;
  }

  disconnectVoice() {
    if (!this.connected) {
      return;
    }

    const networkManager = NetworkManager.getInstance();
    networkManager.disconnectVoice();
    if (networkManager.getOperationMode() === NetworkManager.Mode.CLIENT) {
      networkManager.send(buildClientGamePacket('disconnect-voice'));
    } else {
      WorldManager.getInstance().removeVoiceChannel(networkManager.getSelfPeerId());
      networkManager.send(buildServerGamePacket('voice-channel-data', WorldManager.getInstance().getVoiceChannelUsers()));
    }
    this.disconnectMicrophone();
    this.clearOutputStreams();
    this.connected = false;
  }

  activateMicrophone() {
    if (!this.connected) {
      return new Promise((resolve, reject) => reject(new Error('Not Connected to Voice Channel')));
    }
    const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
       || navigator.mozGetUserMedia;

    return timeout(new Promise((resolve) => {
      if (this.microphoneStream !== undefined) {
        NetworkManager.getInstance().getCallManager().addAudioStream(this.microphoneStream);
        resolve(this.microphoneStream);
      } else {
        getUserMedia({ video: false, audio: true }, (stream) => {
          this.microphoneStream = stream;
          NetworkManager.getInstance().getCallManager().addAudioStream(this.microphoneStream);
          console.log(stream);
          resolve(stream);
        });
      }
    }), 5000);
  }

  disconnectMicrophone() {
    if (this.microphoneStream === undefined) {
      return;
    }

    this.microphoneStream.getTracks().forEach((track) => {
      track.stop();
    });

    NetworkManager.getInstance().getCallManager().removeAudioStream();
    this.microphoneStream = undefined;
  }

  addOutputStream(peerId, stream) {
    if (peerId in this.outputObjects) {
      const audio = this.outputObjects[peerId];
      audio.pause();
      audio.srcObject = stream;
      audio.load();
      audio.play();
    } else {
      const audio = new Audio();
      audio.srcObject = stream;
      audio.autoplay = true;
      audio.play();
      this.outputObjects[peerId] = audio;
    }
  }

  removeOutputStream(peerId) {
    if (peerId in this.outputObjects) {
      const audio = this.outputObjects[peerId];
      audio.pause();
      delete this.outputObjects[peerId];
    }
  }

  clearOutputStreams() {
    Object.keys(this.outputObjects).forEach((x) => {
      this.removeOutputStream(x);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  updateChannelUsers(voiceUsers) {
    const selfId = NetworkManager.getInstance().getSelfPeerId();
    if (!voiceUsers.includes(selfId)) {
      return;
    }

    const remoteUsers = voiceUsers.filter((x) => x !== selfId);

    // Cleanup disconnected users
    NetworkManager.getInstance().getCallManager().getConnectedPeers()
      .filter((x) => !remoteUsers.includes(x))
      .forEach((x) => NetworkManager.getInstance().getCallManager().endCall(x));

    // Connect to remaining or new users
    if (voiceUsers.length === 1) {
      console.log('Only 1 person in voice channel');
      return;
    }
    remoteUsers.forEach((x) => { NetworkManager.getInstance().connectVoice(x); });
  }

  isConnected() {
    return this.connected;
  }

  isMicConnected() {
    return this.microphoneStream !== undefined;
  }
}

class TextChannelManager {
  constructor() {
    this.chatting = false;
    this.bigChatBox = [];
    this.listeners = [];
  }

  addChangeListener(handler) {
    this.listeners.push(handler);
  }

  notifyListeners() {
    this.listeners.forEach((x) => x(this));
  }

  addToHistory(name, msg) {
    this.bigChatBox.push(`${name}: ${msg}`);
    this.notifyListeners();
  }

  getHistory() {
    return this.bigChatBox;
  }
}

class BoardGameManager {
  constructor() {
    this.gameList = [];
    this.gameMenuUI = undefined;
    this.gameOverlayUI = undefined;
    this.currentGame = undefined; // USELESS? NOPE
    this.gameState = undefined; // change to number
    this.tableId = undefined;
    /* GAME STATES
    PLAYING
    HOSTING
    SPECTATING
    WAITING CHECK
    */
  }

  registerGameMenuUI(gameMenuUI) {
    this.gameMenuUI = gameMenuUI;
  }

  registerGameOverlayUI(gameOverlayUI) {
    this.gameOverlayUI = gameOverlayUI;
  }

  register(game) {
    this.gameList.push(game);
  }

  // eslint-disable-next-line class-methods-use-this
  checkPlayerProximity(x, y) {
    if (Math.abs(x - PlayerManager.getInstance().getSelf().x) <= 100
    && Math.abs(y - PlayerManager.getInstance().getSelf().y) <= 100) {
      return true;
    }
    return false;
  }

  handleEvent(unitX, unitY) {
    if (this.gameState === undefined && this.checkPlayerProximity(unitX, unitY)) {
      this.tableId = `${unitX}-${unitY}`;
      if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.CLIENT) {
        NetworkManager.getInstance().send(buildClientGamePacket('check-lobby-state-request', { tableId: this.tableId }));
        this.gameState = 'waitingCheck';
      } else if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.SERVER) {
        if (WorldManager.getInstance().lobbyExist(this.tableId)) {
          if (WorldManager.getInstance().getJoiner(this.tableId) === undefined) {
            if (WorldManager.getInstance().getHost(this.tableId) !== PlayerManager
              .getInstance().getSelfId()) {
              this.displayPage(1);
            }
          } else {
            this.displayPage(2);
          }
        } else {
          this.displayPage(0);
        }
      }
    }
  }

  getGame(gameName) {
    return this.gameList.find((x) => x.gameName === gameName);
  }

  displayPage(page) {
    if (page === -1) {
      this.gameMenuUI.close();
    } else {
      this.gameMenuUI.displayWindow(page);
    }
  }

  closeGameMenu() {
    if (this.gameState === 'hosting') {
      if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.CLIENT) {
        NetworkManager.getInstance().send(buildClientGamePacket('leave-lobby', {
          userId: PlayerManager.getInstance().getSelfId(),
          tableId: this.tableId,
          mode: 'hosting',
        }));
      } else if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.SERVER) {
        WorldManager.getInstance().closeLobby(this.tableId);
      }
    }

    this.gameState = undefined;
  }

  joinGame() {
    let data;
    if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.CLIENT) {
      data = {
        userId: PlayerManager.getInstance().getSelfId(),
        tableId: this.tableId,
        mode: 'player',
      };
      NetworkManager.getInstance().send(buildClientGamePacket('join-lobby', data));
    } else if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.SERVER) {
      WorldManager.getInstance().joinLobby(this.tableId, PlayerManager.getInstance().getSelfId());
      NetworkManager.getInstance().getConnection()
        .sendTo(buildServerGamePacket('start-game', {
          mode: 'player',
          tableId: this.tableId,
          player1: WorldManager.getInstance().getHost(this.tableId),
          player2: WorldManager.getInstance().getJoiner(this.tableId),
          gameName: WorldManager.getInstance().getGameName(this.tableId),
        }), WorldManager.getInstance().getPeerId(WorldManager
          .getInstance().getOpponent(PlayerManager.getInstance().getSelfId())));
      this.currentGame = WorldManager.getInstance().getGameName(this.tableId);
      this.gameState = 'playing';
      this.displayPage(-1);
      this.showGameOverlay();
      this.startGame(this.currentGame,
        WorldManager.getInstance()
          .getHost(this.tableId), WorldManager.getInstance().getJoiner(this.tableId), this.tableId);
    }
  }

  startGame(gameName, p1, p2, lobbyId) {
    const game = this.gameList.find((x) => x.gameName === gameName);
    if (game !== undefined) {
      game.startGame(p1, p2, lobbyId);
      this.currentGame = game.gameName;
      this.displayPage(-1);

      this.gameState = 'playing';
      this.showGameOverlay();
    }
  }

  joinGameSpectate() {
    if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.SERVER) {
      this.gameState = 'spectating';
      const worldManager = WorldManager.getInstance();
      this.spectateGame(
        worldManager.getGameName(this.tableId),
        worldManager.getHost(this.tableId),
        worldManager.getJoiner(this.tableId),
      );
      worldManager.addSpectator(this.tableId, PlayerManager.getInstance().getSelfId());
      this.displayPage(-1);

      const currentState = worldManager.getLobbyGameState(this.tableId);
      this.getGame(worldManager.getGameName(this.tableId))
        .updateState(currentState);
    } else if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.CLIENT) {
      NetworkManager.getInstance().send(buildClientGamePacket('join-lobby', {
        userId: PlayerManager.getInstance().getSelfId(),
        tableId: this.tableId,
        mode: 'spectator',
      }));
      this.displayPage(-1);
    }
  }

  spectateGame(gameName, p1, p2, lobbyId, gameState) {
    const game = this.gameList.find((x) => x.gameName === gameName);
    if (game !== undefined) {
      game.spectateGame(p1, p2, lobbyId);
      if (gameState !== undefined) {
        game.updateState(gameState);
      }
      this.currentGame = gameName;
      this.closeGameMenu();

      this.gameState = 'spectating';
      this.showGameOverlay();
    }
  }

  endGame() {
    const game = this.gameList.find((x) => x.gameName === this.currentGame);
    if (game !== undefined) {
      game.endGame();
      this.closeGameOverlay();
      this.gameState = undefined;
    }
  }

  leaveGame() {
    const game = this.gameList.find((x) => x.gameName === this.currentGame);

    if (game === undefined) {
      this.gameState = undefined;
      this.currentGame = undefined;
      return;
    }
    const selfId = PlayerManager.getInstance().getSelfId();
    const worldManager = WorldManager.getInstance();

    if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.CLIENT) {
      NetworkManager.getInstance().send(buildClientGamePacket('leave-lobby', {
        userId: selfId,
        tableId: this.tableId,
        mode: (this.gameState === 'spectating') ? 'spectator' : 'player',
      }));

      game.endGame();
      this.closeGameOverlay();
    } else if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.SERVER) {
      if (this.gameState === 'spectating') {
        worldManager.removeSpectator(this.tableId, selfId);
      } else {
        NetworkManager.getInstance().getConnection()
          .sendTo(buildServerGamePacket('end-game', selfId), worldManager.getPeerId(worldManager.getOpponent(selfId)));

        worldManager.closeLobby(this.tableId);
        const spectators = worldManager.getSpectators(this.tableId);
        if (spectators !== undefined) {
          spectators.forEach((userId) => {
            NetworkManager.getInstance().getConnection()
              .sendTo(buildServerGamePacket('end-game', selfId), worldManager.getPeerId(userId));
          });
        }
      }
      game.endGame();
      this.closeGameOverlay();
    }

    this.gameState = undefined;
  }

  showGameOverlay() {
    this.gameOverlayUI.show();
  }

  closeGameOverlay() {
    this.gameOverlayUI.close();
  }
}

export default class GameManager {
  constructor() {
    this.voiceChannelManager = new VoiceChannelManager();
    this.textChannelManager = new TextChannelManager();
    this.boardGameManager = new BoardGameManager();
  }

  getVoiceChannelManager() {
    return this.voiceChannelManager;
  }

  getTextChannelManager() {
    return this.textChannelManager;
  }

  getBoardGameManager() {
    return this.boardGameManager;
  }

  static getInstance() {
    if (instance === undefined) {
      instance = new GameManager();
    }
    return instance;
  }
}
