import WorldManager from './world-manager.js';
import NetworkManager from '../net/network-manager.js';
import buildClientGamePacket from '../net/client/game-data-sender.js';
import buildServerGamePacket from '../net/server/game-data-sender.js';
import { timeout } from '../utils.js';

import PlayerManager from './player-manager.js';

let instance;

class VoiceChannelManager {
  constructor() {
    this.connected = false;
    this.outputMuted = false;
    this.microphoneStream = undefined;
    this.outputObjects = {};
  }

  joinVoice() {
    if (this.connected) {
      return;
    }

    this.outputsMuted = false;
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
    let audio;
    if (peerId in this.outputObjects) {
      audio = this.outputObjects[peerId];
      audio.pause();
      audio.srcObject = stream;
      audio.load();
      audio.play();
    } else {
      audio = new Audio();
      audio.srcObject = stream;
      audio.autoplay = true;
      audio.play();
      this.outputObjects[peerId] = audio;
    }

    if (this.outputMuted) {
      audio.volume = 0;
    } else {
      audio.volume = 1;
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

  muteOutputs() {
    if (this.outputMuted) return;

    Object.keys(this.outputObjects).forEach((peerId) => {
      const audio = this.outputObjects[peerId];
      audio.volume = 0;
    });
    this.outputMuted = true;
  }

  unmuteOutputs() {
    if (!this.outputMuted) return;

    Object.keys(this.outputObjects).forEach((peerId) => {
      const audio = this.outputObjects[peerId];
      audio.volume = 1;
    });
    this.outputMuted = false;
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

  isOutputMuted() {
    return this.outputMuted;
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

const BOARDGAME_STATE = {
  WAITING_CHECK: 'waitingCheck',
  SELECTING: 'selecting',
  HOSTING: 'hosting',
  PLAYING: 'playing',
  SPECTATING: 'spectating',
};

class BoardGameManager {
  constructor() {
    this.gameList = [];
    this.gameMenuUI = undefined;
    this.gameOverlayUI = undefined;
    this.currentGame = undefined;
    this.gameState = undefined;
    this.tableId = undefined;
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
        this.gameState = BOARDGAME_STATE.WAITING_CHECK;
      } else if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.SERVER) {
        if (WorldManager.getInstance().lobbyExists(this.tableId)) {
          const lobby = WorldManager.getInstance().getLobby(this.tableId);
          if (!lobby.isFull()) {
            if (lobby.host !== PlayerManager.getInstance().getSelfId()) {
              this.displayPage(1);
            }
          } else {
            this.displayPage(2);
          }
        } else {
          this.displayPage(0);
        }
        this.gameState = BOARDGAME_STATE.SELECTING;
      }
    }
  }

  getGame(gameName) {
    return this.gameList.find((x) => x.gameName === gameName);
  }

  setGameState(state) {
    this.gameState = state;
  }

  displayPage(page) {
    if (page === -1) {
      this.gameMenuUI.close();
    } else {
      this.gameMenuUI.displayWindow(page);
    }
  }

  closeGameMenu() {
    if (this.gameState === BOARDGAME_STATE.HOSTING) {
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
    const selfId = PlayerManager.getInstance().getSelfId();
    let data;
    if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.CLIENT) {
      data = {
        userId: selfId,
        tableId: this.tableId,
        mode: 'player',
      };
      NetworkManager.getInstance().send(buildClientGamePacket('join-lobby', data));
    } else if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.SERVER) {
      const lobby = WorldManager.getInstance().joinLobby(this.tableId, selfId);
      if (lobby === undefined) {
        alert('Failed to join lobby');
        return;
      }

      NetworkManager.getInstance().getConnection()
        .sendTo(buildServerGamePacket('start-game', {
          mode: 'player',
          tableId: this.tableId,
          player1: lobby.host,
          player2: lobby.joiner,
          gameName: lobby.gameName,
        }), WorldManager.getInstance().getPeerId(lobby.getOpponent(selfId)));
      this.currentGame = lobby.gameName;
      this.gameState = BOARDGAME_STATE.PLAYING;
      this.displayPage(-1);
      this.showGameOverlay();
      this.startGame(this.currentGame, lobby.host, lobby.joiner, this.tableId);
    }
  }

  startGame(gameName, p1, p2, lobbyId) {
    const game = this.gameList.find((x) => x.gameName === gameName);
    if (game !== undefined) {
      game.startGame(p1, p2, lobbyId);
      this.currentGame = game.gameName;
      this.displayPage(-1);

      this.gameState = BOARDGAME_STATE.PLAYING;
      this.showGameOverlay();
    }
  }

  joinGameSpectate() {
    if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.SERVER) {
      this.gameState = BOARDGAME_STATE.SPECTATING;
      const worldManager = WorldManager.getInstance();
      if (worldManager.lobbyExists(this.tableId)) {
        const lobby = worldManager.getLobby(this.tableId);
        this.spectateGame(lobby.gameName, lobby.host, lobby.joiner, this.tableId, lobby.gameState);
        lobby.addSpectator(PlayerManager.getInstance().getSelfId());
        this.displayPage(-1);
      } else {
        alert('Failed to join lobby');
      }
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

      this.gameState = BOARDGAME_STATE.SPECTATING;
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
        mode: this.gameState,
      }));

      game.endGame();
      this.closeGameOverlay();
    } else if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.SERVER) {
      if (this.gameState === BOARDGAME_STATE.SPECTATING) {
        if (worldManager.lobbyExists(this.tableId)) {
          worldManager.getLobby(this.tableId).removeSpectator(selfId);
        }
      } else {
        NetworkManager.getInstance().getConnection().sendTo(
          buildServerGamePacket('end-game', selfId),
          worldManager.getPeerId(worldManager.getLobby(this.tableId).getOpponent(selfId)),
        );

        if (worldManager.lobbyExists(this.tableId)) {
          worldManager.getLobby(this.tableId).spectators.forEach((userId) => {
            NetworkManager.getInstance().getConnection().sendTo(
              buildServerGamePacket('end-game', selfId),
              worldManager.getPeerId(userId),
            );
          });
        }

        worldManager.closeLobby(this.tableId);
      }
      game.endGame();
      this.tableId = undefined;
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

class WhiteboardManager {
  constructor() {
    this.boardUI = undefined;
    this.currentBoard = undefined;
  }

  registerUI(boardUI) {
    this.boardUI = boardUI;
  }

  openBoard(x, y) {
    const boardId = `${x}-${y}`; // Follows Table Convention
    const worldManager = WorldManager.getInstance();

    this.currentBoard = boardId;

    if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.SERVER) {
      const openState = worldManager.registerWhiteboard(boardId, (userId, state, delta) => {
        // Notifier
        if (userId === PlayerManager.getInstance().getSelfId()) {
          this.updateBoardState(boardId, state, delta);
        } else {
          const update = { id: boardId };
          if (delta !== undefined) {
            update.delta = delta;
          } else {
            update.state = state;
          }
          NetworkManager.getInstance().getConnection().sendTo(buildServerGamePacket('whiteboard-state-echo', update), worldManager.getPeerId(userId));
        }
      });
      worldManager.addWhiteboardPlayer(boardId, PlayerManager.getInstance().getSelfId());
      if (openState !== undefined) {
        this.updateBoardState(boardId, openState);
      }
    } else {
      // Register to receive updates
      NetworkManager.getInstance().send(buildClientGamePacket('join-whiteboard', { id: boardId }));
    }

    this.boardUI.show();
    this.boardUI.setCloseListener(() => {
      this.currentBoard = undefined;
      if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.SERVER) {
        worldManager.removeWhiteboardPlayer(boardId, PlayerManager.getInstance().getSelfId());
      } else {
        NetworkManager.getInstance().send(buildClientGamePacket('leave-whiteboard', { id: boardId }));
      }
    });
    this.boardUI.setUpdateListener((state, delta) => {
      if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.SERVER) {
        worldManager.updateWhiteboardState(this.currentBoard, state, delta,
          PlayerManager.getInstance().getSelfId());
      } else {
        NetworkManager.getInstance().send(buildClientGamePacket('update-whiteboard', { id: boardId, state, delta }));
      }
    });
  }

  updateBoardState(boardId, state, delta) {
    if (this.currentBoard !== boardId) {
      return;
    }

    if (delta) {
      // Perform delta update
      console.debug('delta update');
      this.boardUI.deltaCanvasUpdate(delta);
    } else {
      // Stateful update
      console.debug('state update');
      this.boardUI.setCanvasState(state);
    }
  }
}

export default class GameManager {
  constructor() {
    this.voiceChannelManager = new VoiceChannelManager();
    this.textChannelManager = new TextChannelManager();
    this.boardGameManager = new BoardGameManager();
    this.whiteboardManager = new WhiteboardManager();
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

  getWhiteboardManager() {
    return this.whiteboardManager;
  }

  static getInstance() {
    if (instance === undefined) {
      instance = new GameManager();
    }
    return instance;
  }
}
