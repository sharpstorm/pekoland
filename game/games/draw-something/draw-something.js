import WorldManager from '../../managers/world-manager.js';
import NetworkManager from '../../net/network-manager.js';
import PlayerManager from '../../managers/player-manager.js';
import buildClientGamePacket from '../../net/client/game-data-sender.js';
import buildServerGamePacket from '../../net/server/game-data-sender.js';
import {
  DrawSomethingWhiteboard,
  DrawSomethingInputBox,
  DrawSomethingPrompt,
  DrawSomethingTimer,
  DrawSomethingScore,
} from './draw-something-interface.js';

export default class DrawSomething {
  constructor() {
    this.players = [];
    this.gameName = 'Draw Something';
    this.whiteBoard = new DrawSomethingWhiteboard();
    this.inputBox = new DrawSomethingInputBox();
    this.prompt = new DrawSomethingPrompt();
    this.timer = new DrawSomethingTimer();
    this.score = new DrawSomethingScore();
    this.gameFin = false;
    this.gameOn = false;
    this.currentTurn = undefined;
    this.currentWord = undefined;
    this.pCounter = 0;
    this.wordList = ['Apple', 'Dog', 'Cat', 'Rabbit', 'Tree', 'Flower'];
    this.scoreTable = {};
  }

  // eslint-disable-next-line class-methods-use-this
  importWordList() {
    const fso = new ActiveXObject('Scripting.FileSystemObject');
		const s = fso.OpenTextFile('test.txt', 1, false);
    console.log(fileList);
  }

  handleEvent(evtId, e) {
    const data = {
      from: PlayerManager.getInstance().getSelfId(),
      state: {
        nextRound: undefined,
        word: undefined,
        drawing: undefined,
        nextDrawer: undefined,
        correct: undefined,
      },
    };
    if (this.gameOn && this.currentTurn === PlayerManager.getInstance().getSelfId()) {
      this.sendNetworkUpdate(data);
      this.whiteBoard.handle(e);
    } else if (evtId === 'keydown') {
      this.inputBox.handle(e);
      if (e.key === 'Enter') {
        if (this.inputBox.getWord().toUpperCase() === this.currentWord.toUpperCase()) {
          data.state.nextRound = true;
          this.currentWord = undefined;
          data.state.correct = true;
          this.inputBox.correct();
          this.prompt.set('Correct!');
          this.scoreTable[PlayerManager.getInstance().getSelfId()] += 1;
          setTimeout(() => {
            this.score.increase();
            this.nextRound();
            this.sendNetworkUpdate(data);
          }, 1000);
        } else {
          this.inputBox.wrong();
        }
      }
    }
  }

  sendNetworkUpdate(data) {
    const dataToSend = data;
    if (dataToSend.state !== undefined) {
      dataToSend.gameName = this.gameName;
      dataToSend.lobbyId = this.lobbyId;
      dataToSend.state.drawing = this.whiteBoard.getImage();
      if (this.currentTurn === PlayerManager.getInstance().getSelfId()
      && this.currentWord === undefined) {
        this.currentWord = this.wordList[Math.floor(Math.random() * (this.wordList.length))];
        this.wordList.splice(this.wordList.indexOf(this.currentWord), 1);
        this.prompt.set(`Draw ${this.currentWord}`);
        dataToSend.state.word = this.currentWord;
        this.timer.start();
      }
      if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.CLIENT) {
        NetworkManager.getInstance().send(buildClientGamePacket('game-update', data));
      } else if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.SERVER) {
        WorldManager.getInstance().updateLobbyGameState(this.lobbyId, data.state);
        WorldManager.getInstance().lobbyForAll(this.lobbyId, (userId) => {
          if (userId === PlayerManager.getInstance().getSelfId()) {
            return;
          }
          NetworkManager.getInstance().getConnection()
            .sendTo(buildServerGamePacket('game-update-echo', data), WorldManager.getInstance().getPeerId(userId));
        });
      }
    }
  }

  handleNetworkEvent(data) {
    if (!this.gameOn) {
      return;
    }
    const wb = this.whiteBoard;
    if (this.gameOn && wb !== undefined && this.lobbyId === data.lobbyId
        && this.currentTurn !== PlayerManager.getInstance().getSelfId()) {
      wb.updateBoard(data.state.drawing);
    }
    if (data.state.word !== undefined && data.state.word !== null) {
      this.currentWord = data.state.word;
      this.wordList.splice(this.wordList.indexOf(this.currentWord), 1);
      this.prompt.set(`${data.from} is drawing`);
      if (data.state.timeUp && this.players.includes(PlayerManager.getInstance().getSelfId())) {
        this.prompt.set(`Draw ${data.state.word}`);
      }
      this.timer.start();
    }
    if (data.state.nextRound) {
      this.whiteBoard.freeze = false;
      this.nextRound();
    }
    if (data.state.correct) {
      this.scoreTable[data.from] += 1;
    }
  }

  nextRound() {
    this.timer.reset();
    this.inputBox.reset();
    this.whiteBoard.reset();
    this.currentTurn = this.players[this.pCounter];
    this.pCounter += 1;
    if (this.pCounter === this.players.length) {
      this.pCounter = 0;
    }
  }

  startGame(p1, p2, lobbyId) {
    this.players = [];
    this.gameOn = true;
    this.lobbyId = lobbyId;
    this.currentTurn = p1;
    this.currentWord = undefined;
    this.gameFin = false;
    this.pCounter = 0;
    this.wordList = ['Apple', 'Dog', 'Cat', 'Rabbit', 'Tree', 'Flower'];
    this.scoreTable[p1] = 0;
    this.scoreTable[p2] = 0;
    this.prompt.reset();
    this.timer.reset();
    this.whiteBoard.reset();
    this.players.push(p1);
    this.players.push(p2);
    this.nextRound();
  }

  endGame() {
    this.gameOn = false;
    this.lobbyId = undefined;
  }

  spectateGame(p1, p2, lobbyId) {
    this.gameOn = true;
    this.lobbyId = lobbyId;
    this.players.push(p1);
    this.players.push(p2);
    this.prompt.set('Waiting for next round to start');
    this.whiteBoard.freeze = true;
  }

  updateState(state) {
    this.whiteBoard.updateBoard(state);
  }

  getState() {
    return this.whiteBoard.getImage();
  }

  draw(ctx, camContext) {
    if (this.gameOn) {
      if (this.wordList.length === 0 && !this.gameFin) {
        this.prompt.set(`Final Score: ${this.players[0]}: ${this.scoreTable[this.players[0]]}, ${this.players[1]}: ${this.scoreTable[this.players[1]]}`);
        if (this.scoreTable[this.players[0]] > this.scoreTable[this.players[1]]) {
          alert(`${this.players[0]} wins`);
        } else if (this.scoreTable[this.players[0]] < this.scoreTable[this.players[1]]) {
          alert(`${this.players[1]} wins`);
        } else {
          alert('Its a draw');
        }
        this.timer.stop();
        this.gameFin = true;
      }
      this.whiteBoard.draw(ctx, camContext);
      this.timer.draw(ctx, camContext);
      this.score.draw(ctx, camContext);
      this.prompt.draw(ctx, camContext);
      if (this.timer.getTime() < 1 && !this.gameFin) {
        this.timer.stop();
        this.timer.reset();
        this.prompt.set('TIME\'S UP!');
        if (this.currentTurn === PlayerManager.getInstance().getSelfId()) {
          const data = {
            from: PlayerManager.getInstance().getSelfId(),
            state: { nextRound: undefined, word: undefined, drawing: undefined },
          };
          this.nextRound();
          setTimeout(() => {
            this.currentWord = this.wordList[Math.floor(Math.random() * (this.wordList.length))];
            this.wordList.splice(this.wordList.indexOf(this.currentWord), 1);
            data.state.word = this.currentWord;
            data.state.nextRound = true;
            data.state.timeUp = true;

            this.sendNetworkUpdate(data);
            this.prompt.set(`${this.currentTurn} is drawing`);
            this.timer.start();
          }, 1000);
          this.whiteBoard.reset();
        }
      }
      if (this.currentTurn !== PlayerManager.getInstance().getSelfId()
      && this.players.includes(PlayerManager.getInstance().getSelfId())) {
        this.inputBox.draw(ctx, camContext);
      }
    }
  }
}
