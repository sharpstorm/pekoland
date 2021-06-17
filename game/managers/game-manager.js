import WorldManager from './world-manager.js';
import NetworkManager from '../net/network-manager.js';
import buildClientGamePacket from '../net/client/game-data-sender.js';
import buildServerGamePacket from '../net/server/game-data-sender.js';
import MapManager from './map-manager.js';
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
    this.tableID = undefined;
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

  handleEvent(eventId, event, camContext) {
    if (eventId === 'click') {
      const worldX = camContext.x + event.clientX;
      const worldY = camContext.y + event.clientY;

      // Round to nearest 100
      const floorX = Math.floor(worldX / 100) * 100;
      const floorY = Math.floor(worldY / 100) * 100;

      const clickedData = MapManager.getInstance().getCurrentMap().getFurniture(worldX, worldY);

      if (clickedData === 'BoardGame' && this.gameState === undefined && this.checkPlayerProximity(floorX, floorY)) {
        this.tableID = `${floorX}-${floorY}`;
        let data;
        if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.CLIENT) {
          data = { host: PlayerManager.getInstance().getSelfId(), tableID: this.tableID, action: 'checkLobby' };
          NetworkManager.getInstance().send(buildClientGamePacket('game-lobby', data));
          this.gameState = 'waitingCheck';
        } else if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.SERVER) {
          if (WorldManager.getInstance().lobbyExist(this.tableID)) {
            if (WorldManager.getInstance().getLobbyJoiner(this.tableID) === undefined) {
              if (WorldManager.getInstance().getLobbyHost(this.tableID) !== PlayerManager
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
        const data = {
          host: PlayerManager.getInstance().getSelfId(),
          tableID: this.tableID,
          action: 'closeLobby',
        };
        NetworkManager.getInstance().send(buildClientGamePacket('game-lobby', data));
      } else if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.SERVER) {
        WorldManager.getInstance().closeLobby(this.tableID);
      }
    }

    this.gameState = undefined;
  }

  joinGame() {
    let data;
    if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.CLIENT) {
      data = {
        joiner: PlayerManager.getInstance().getSelfId(),
        tableID: this.tableID,
        action: 'joinGame',
      };
      NetworkManager.getInstance().send(buildClientGamePacket('game-lobby', data));
    } else if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.SERVER) {
      WorldManager.getInstance().joinLobby(this.tableID, PlayerManager.getInstance().getSelfId());
      console.log(WorldManager.getInstance().gameLobbies);
      data = {
        host: WorldManager.getInstance().getLobbyHost(this.tableID),
        joiner: WorldManager.getInstance().getLobbyJoiner(this.tableID),
        tableID: this.tableID,
        gameName: WorldManager.getInstance().getGameName(this.tableID),
        action: 'startGame',
      };
      NetworkManager.getInstance().send(buildServerGamePacket('game-lobby-echo', data));
      this.currentGame = data.gameName;
      this.gameState = 'playing';
      this.displayPage(-1);
      this.showGameOverlay();
      this.startGame(data.gameName, data.host, data.joiner, data.tableID);
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

  spectateGame(gameName, p1, p2) {
    const game = this.gameList.find((x) => x.gameName === gameName);
    if (game !== undefined) {
      game.spectateGame(p1, p2);
      this.currentGame = gameName;
      this.closeGameMenu();

      this.gameState = 'spectating';
      this.showGameOverlay();
    }
  }

  endGame() {
    alert('The other party has left the game');
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

    if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.CLIENT) {
      if (this.gameState === 'spectating') {
        const data = {
          host: PlayerManager.getInstance().getSelfId(),
          tableID: this.tableID,
          action: 'leave-spectate',
        };
        NetworkManager.getInstance().send(buildClientGamePacket('game-lobby', data));
      } else {
        const data = {
          host: PlayerManager.getInstance().getSelfId(),
          tableID: this.tableID,
          action: 'leaveGame',
        };
        NetworkManager.getInstance().send(buildClientGamePacket('game-lobby', data));
      }

      game.endGame();
      this.closeGameOverlay();
    } else if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.SERVER) {
      if (this.gameState === 'spectating') {
        WorldManager.getInstance()
          .gameLobbies[this.tableID].spectators
          .pop((PlayerManager.getInstance().getSelfId()));
        console.log(WorldManager.getInstance().gameLobbies);
      } else {
        const data = {
          host: WorldManager.getInstance().getLobbyHost(this.tableID),
          joiner: WorldManager.getInstance().getLobbyJoiner(this.tableID),
          tableID: this.tableID,
          action: 'leaveGame',
        };
        WorldManager.getInstance().closeLobby(this.tableID);
        NetworkManager.getInstance().send(buildServerGamePacket('game-lobby-echo', data));
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
