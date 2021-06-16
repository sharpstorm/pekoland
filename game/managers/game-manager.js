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
    this.uiLayer = undefined;
    this.currentGame = undefined; // USELESS?
    this.gameState = undefined; // USELESS
    this.tableID = undefined;
  }

  register(game) {
    this.gameList.push(game);
  }

  render(ctx, camContext) {
    this.gameList.forEach((game) => game.draw(ctx, camContext));
  }

  propagateEvent(eventID, event, camContext, uiLayer) {
    this.uiLayer = uiLayer; // TO CHANGE TO CONSTRUCTOR
    const clickedData = MapManager.getInstance().getCurrentMap()
      .getFuniture(camContext.x + event.clientX, camContext.y + event.clientY);
    const floorX = Math.floor((camContext.x + event.clientX) / 100) * 100;
    const floorY = Math.floor((camContext.y + event.clientY) / 100) * 100;
    if (clickedData === 'BoardGame') {
      this.tableID = `${floorX}-${floorY}`;
      console.log(this.tableID);
      if (NetworkManager.getInstance().getOperationMode() === 2) {
        // IF MODE = CLIENT, CHECK CLICKED LOBBY SATUS
        const data = {
          host: PlayerManager.getInstance().getSelfId(),
          tableID: this.tableID,
          action: 'checkLobby',
        };
        NetworkManager.getInstance().send(buildClientGamePacket('gameLobby', data));
      } else if (NetworkManager.getInstance().getOperationMode() === 1) {
        if (WorldManager.getInstance().lobbyExist(this.tableID)) {
          if (WorldManager.getInstance().getLobbyJoiner(this.tableID) === undefined) {
            if (WorldManager.getInstance().getLobbyHost(this.tableID) !== PlayerManager
              .getInstance().getSelfId()) {
              this.showJoinGame();
            }
          } else {
            // OCCUPIED. SPECTATE
          }
        } else {
          // LOBBY WITH TABLE ID DOESNT EXIST
          // console.log('server game menu');
          this.showGameMenu();
        }
      }
    }
  }

  closeMenu() {
    if (NetworkManager.getInstance().getOperationMode() === 2) {
      if (this.gameState === 'hosting') {
        // SEND CLOSE LOBBY REQ
        const data = {
          host: PlayerManager.getInstance().getSelfId(),
          tableID: this.tableID,
          action: 'closeLobby',
        };
        NetworkManager.getInstance().send(buildClientGamePacket('gameLobby', data));
      }
    } else if (NetworkManager.getInstance().getOperationMode() === 1) {
      if (this.gameState === 'hosting') {
        console.log(WorldManager.getInstance().gameLobbies);
        WorldManager.getInstance().closeLobby(this.tableID);
        console.log(WorldManager.getInstance().gameLobbies);
      }
    }
  }

  joinGame() {
    if (NetworkManager.getInstance().getOperationMode() === 2) {
      const data = {
        joiner: PlayerManager.getInstance().getSelfId(),
        tableID: this.tableID,
        action: 'joinGame',
      };
      NetworkManager.getInstance().send(buildClientGamePacket('gameLobby', data));
    } else if (NetworkManager.getInstance().getOperationMode() === 1) {
      WorldManager.getInstance().joinLobby(this.tableID, PlayerManager
        .getInstance().getSelfId());
      console.log(WorldManager.getInstance().gameLobbies);
      const data = {
        host: WorldManager.getInstance().getLobbyHost(this.tableID),
        joiner: WorldManager.getInstance().getLobbyJoiner(this.tableID),
        tableID: this.tableID,
        gameName: WorldManager.getInstance().getGameName(this.tableID),
        action: 'startGame',
      };
      NetworkManager.getInstance().send(buildServerGamePacket('gameLobby-echo', data));
      this.toggle();
    }
  }

  startGame(gameName, p1, p2) {
    this.gameList.forEach((game) => {
      if (game.gameName === gameName) {
        game.startGame(p1, p2);
        this.toggle();
      }
    });
  }

  toggle() {
    this.uiLayer.elements.forEach((e) => {
      // console.log(e);
      if (e.constructor.name === 'GameMenu') {
        e.toggle();
      }
    });
  }

  showGameMenu() {
    this.uiLayer.elements.forEach((e) => {
      // console.log(e);
      if (e.constructor.name === 'GameMenu') {
        e.showGameMenu();
      }
    });
  }

  showJoinGame() {
    this.uiLayer.elements.forEach((e) => {
      // console.log(e);
      if (e.constructor.name === 'GameMenu') {
        e.showJoinGame();
      }
    });
  }

  showWaitingScreen() {
    this.uiLayer.elements.forEach((e) => {
      // console.log(e);
      if (e.constructor.name === 'GameMenu') {
        e.waiting();
      }
    });
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
