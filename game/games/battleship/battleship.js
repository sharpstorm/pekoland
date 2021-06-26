/* Follows Singleton Design (Only one instance exists)
  Interface methods:
    handleEvent(eventId, event, cameraContext)
    handleNetworkEvent(data)
    startgame(player1, player2, lobbyId)
    spectateGame(player1, player2, lobbyId)
    endGame()
    updateState(newState)
    getState()
    draw(ctx, camContext)
  Must set Class.gameName variable
*/

/* Follows the Salvo Ruleset */

import BattleshipBoard from './battleship-board.js';
import BattleshipPlacementUI from './battleship-placing.js';
import BattleshipTitleBoard from './battleship-title.js';

import NetworkManager from '../../net/network-manager.js';
import WorldManager from '../../managers/world-manager.js';
import PlayerManager from '../../managers/player-manager.js';
import buildClientGamePacket from '../../net/client/game-data-sender.js';
import buildServerGamePacket from '../../net/server/game-data-sender.js';
import SpriteManager from '../../managers/sprite-manager.js';

const margin = 50;
const titleHeight = 150;

export default class BattleshipGame {
  constructor() {
    this.gameName = 'Battleship';

    this.reset();
  }

  handleEvent(evtId, e, camContext) {
    if (!this.gameActive) {
      return;
    }
    if (evtId !== 'click') {
      return;
    }

    if (this.gameState === 0 && this.placementUI !== undefined) {
      this.placementUI.handleEvent(evtId, e, this.calculateDrawnParams(camContext));
    } else if (this.gameState === 1 && this.isTurn(PlayerManager.getInstance().getSelfId())) {
      // game started and turn
      const { boardSize, marginLeft, marginTop } = this.calculateDrawnParams(camContext);
      // Fire board is always on the right
      const baseX = marginLeft + margin + boardSize;
      const baseY = marginTop + titleHeight;
      if (e.clientX > baseX && e.clientX < baseX + boardSize
        && e.clientY > baseY && e.clientY < baseY + boardSize) {
        const { oppBoard, myBoard } = this.resolveBoards();

        const coords = oppBoard.getGridAtPosition(e.clientX - baseX, e.clientY - baseY,
          boardSize);
        if (coords !== undefined) {
          // Fire Target
          if (oppBoard.getGridStateAtPosition(coords.x, coords.y) === BattleshipBoard.STATE.EMPTY) {
            if (this.shots.length < myBoard.getShipsAlive()) {
              oppBoard.setGridStateAtPosition(coords.x, coords.y, BattleshipBoard.STATE.AIM);
              this.shots.push(coords);
            }
          } else if (oppBoard.getGridStateAtPosition(coords.x, coords.y)
            === BattleshipBoard.STATE.AIM) {
            // Reset Mark
            oppBoard.setGridStateAtPosition(coords.x, coords.y, BattleshipBoard.STATE.EMPTY);
            this.shots = this.shots.filter((shot) => shot.x !== coords.x || shot.y !== coords.y);
          }
          this.titleBoard.updateShots(myBoard.getShipsAlive() - this.shots.length);
        }
      } else if (e.clientX > marginLeft && e.clientX < marginLeft + margin + (boardSize * 2)
        && e.clientY > marginTop && e.clientY < marginTop + titleHeight) {
        this.titleBoard.handleEvent(evtId, e, marginLeft, marginTop,
          marginLeft + margin + (boardSize * 2), titleHeight);
      }
    }
  }

  handleNetworkEvent(data) {
    if (this.gameActive && this.lobbyId === data.lobbyId) {
      if (data.action.move === 'shipsPlaced') {
        this.updateState(data.state);
        this.checkBattleStage();
      } else if (data.action.move === 'fire' && this.isPlaying(PlayerManager.getInstance().getSelfId())) {
        const { shots } = data.action;
        const { myBoard } = this.resolveBoards();
        const result = shots.map((shot) => ({
          result: myBoard.fireAt(shot.x, shot.y),
          x: shot.x,
          y: shot.y,
        }));

        this.animateShots(result, myBoard, this.nextTurn.bind(this));
        this.sendNetworkUpdate({
          action: { move: 'fireReply', result },
        });
      } else if (data.action.move === 'fireReply') {
        const { result } = data.action;
        const { oppBoard } = this.resolveBoards(data.from);

        this.animateShots(result, oppBoard);
      }
    }
  }

  startGame(p1, p2, lobbyId) {
    if (this.gameActive) {
      return;
    }

    this.gameActive = true;
    this.lobbyId = lobbyId;
    this.player1 = p1;
    this.player2 = p2;
    this.gameState = 0;

    const selfId = PlayerManager.getInstance().getSelfId();
    this.player1Board = new BattleshipBoard(p1 !== selfId);
    this.player2Board = new BattleshipBoard(p2 !== selfId);
    this.placementUI = new BattleshipPlacementUI(margin, titleHeight,
      (p1 === selfId) ? this.player1Board : this.player2Board,
      this.placementComplete.bind(this));
    this.titleBoard = new BattleshipTitleBoard();
    this.titleBoard.attachFireHandler(this.fireShots.bind(this));
  }

  spectateGame(p1, p2, lobbyId) {
    if (this.gameActive) {
      return;
    }

    this.gameActive = true;
    this.lobbyId = lobbyId;
    this.player1 = p1;
    this.player2 = p2;
    this.gameState = 0;

    this.player1Board = new BattleshipBoard(false);
    this.player2Board = new BattleshipBoard(false);
    this.titleBoard = new BattleshipTitleBoard(true);
    this.titleBoard.setState(3);
  }

  endGame() {
    if (!this.gameActive) {
      return;
    }

    this.reset();
  }

  reset() {
    this.gameActive = false;
    this.player1 = undefined;
    this.player2 = undefined;
    this.turn = undefined;
    this.gameState = 0;
    this.placementUI = undefined;
    this.titleBoard = undefined;
    this.player1Board = undefined;
    this.player2Board = undefined;

    // Aim Stage Temp Params
    this.shots = [];

    // Animation Control
    this.animationList = undefined;
    this.currentFrame = undefined;
    this.animationTarget = undefined;
  }

  updateState(state) {
    if (state) {
      this.turn = state.turn;
      this.gameState = state.gameState;
      if (this.player1 !== PlayerManager.getInstance().getSelfId()) {
        this.player1Board.updateState(state.player1Board);
      }
      if (this.player2 !== PlayerManager.getInstance().getSelfId()) {
        this.player2Board.updateState(state.player2Board);
      }
      if (state.gameState === 2) {
        // Fast Forward the animation
        this.gameState = 1;
        if (state.fireInfo !== undefined) {
          const board = state.fireInfo.target === 1 ? this.player1Board : this.player2Board;
          state.fireInfo.shots.forEach((cell) => {
            board.setGridStateAtPosition(cell.x, cell.y,
              cell.result ? BattleshipBoard.STATE.HIT : BattleshipBoard.STATE.MISS);
          });
        }
      }
    }
  }

  getState() {
    let fireInfo;

    if (this.animationTarget !== undefined) {
      // Include info for fast forwarding
      fireInfo = {
        target: this.animationTarget === this.player1Board ? 1 : 2,
        shots: this.animationList,
      };
    }
    return {
      turn: this.turn,
      gameState: this.gameState,
      player1Board: this.player1Board.getState(),
      player2Board: this.player2Board.getState(),
      fireInfo,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  calculateDrawnParams(camContext) {
    const gridWidth = Math.floor((camContext.viewportWidth - (margin * 3)) / 2);
    const gridHeight = Math.floor(camContext.viewportHeight - (margin * 2) - titleHeight);
    const boardSize = Math.min(gridWidth, gridHeight);
    const marginLeft = Math.floor((camContext.viewportWidth - (margin + (boardSize * 2))) / 2);
    const marginTop = Math.floor((camContext.viewportHeight - (boardSize + titleHeight)) / 2);

    return { boardSize, marginLeft, marginTop };
  }

  draw(ctx, camContext, majorUpdate) {
    if (!this.gameActive) {
      return;
    }

    const { boardSize, marginLeft, marginTop } = this.calculateDrawnParams(camContext);

    this.titleBoard.draw(ctx, marginLeft, marginTop, boardSize * 2 + margin, titleHeight);
    if (this.gameState === 0 && this.placementUI) {
      // Placement State
      this.placementUI.draw(ctx, marginLeft, marginTop + titleHeight, boardSize);
    } else {
      // Playing State
      let leftBoard = this.player1Board;
      let rightBoard = this.player2Board;
      if (this.player2 === PlayerManager.getInstance().getSelfId()) {
        // Flip Sides
        leftBoard = this.player2Board;
        rightBoard = this.player1Board;
      }
      leftBoard.draw(ctx, marginLeft, marginTop + titleHeight, boardSize);
      rightBoard.draw(ctx, marginLeft + margin + boardSize,
        marginTop + titleHeight, boardSize);

      // Animation Layer
      if (this.animationList !== undefined && this.animationList.length > 0) {
        const boardParams = leftBoard.getDrawParams(boardSize); // Both boards same size, same param
        // Update frame
        if (majorUpdate && this.currentFrame >= 0 && this.currentFrame < 15) {
          this.currentFrame += 1;
          if (this.currentFrame >= 15) {
            // Update board
            const cell = this.animationList[0];
            this.animationTarget.setGridStateAtPosition(cell.x, cell.y,
              cell.result ? BattleshipBoard.STATE.HIT : BattleshipBoard.STATE.MISS);
            this.animationTarget.updateAlive();
            this.animationList.splice(0, 1);

            if (this.animationList.length === 0) {
              this.animationList = undefined;
              this.currentFrame = undefined;
              this.animationList = undefined;
              this.animateShotsFinished();
              return;
            }
            this.currentFrame = 0;
          }
        }
        const sprite = SpriteManager.getInstance().getSprite('battleship-explosion');
        let cellX = marginLeft + boardParams.padding
          + (boardParams.cellSize * this.animationList[0].x);
        const cellY = marginTop + titleHeight + boardParams.padding
          + (boardParams.cellSize * this.animationList[0].y);

        if (this.animationTarget === rightBoard) {
          // Shoot Left to Right
          cellX += margin + boardSize;
        }
        sprite.getSpriteAtFrame(this.currentFrame).drawAt(ctx, cellX, cellY);
      }
    }
  }

  animateShots(shots, targetBoard) {
    this.animationList = shots;
    this.currentFrame = 0;
    this.animationTarget = targetBoard;
    this.gameState = 2;
  }

  animateShotsFinished() {
    const winner = this.checkWin();
    if (winner > 0) {
      this.titleBoard.setState(2 + winner);
      this.gameState = 3;
    } else {
      this.gameState = 1;
      this.nextTurn();
    }
  }

  placementComplete() {
    this.sendNetworkUpdate({
      action: { move: 'shipsPlaced' },
    });
    this.checkBattleStage();
  }

  checkBattleStage() {
    if (this.player1Board.isShipsPlaced()
      && this.player2Board.isShipsPlaced()
      && this.gameState === 0) {
      this.placementUI = undefined;
      this.gameState = 1;
      this.turn = this.player1;
      this.titleBoard.setState(this.isTurn(PlayerManager.getInstance().getSelfId()) ? 1 : 2);
      this.titleBoard.updateShots(5);
    }
  }

  fireShots() {
    const { myBoard } = this.resolveBoards();
    if (myBoard.getShipsAlive() > this.shots.length) {
      return; // Has not selected all shots
    }

    this.sendNetworkUpdate({
      action: { move: 'fire', shots: this.shots },
    });
    this.gameState = 2; // Disables input
  }

  isPlaying(playerId) {
    return this.player1 === playerId || this.player2 === playerId;
  }

  isTurn(playerId) {
    return this.turn === playerId;
  }

  resolveBoards(from) {
    if (from) {
      return {
        oppBoard: (this.player1 === from) ? this.player1Board : this.player2Board,
        myBoard: (this.player1 === from) ? this.player2Board : this.player1Board,
      };
    }
    return {
      oppBoard: (this.player1 === PlayerManager.getInstance().getSelfId())
        ? this.player2Board : this.player1Board,
      myBoard: (this.player1 === PlayerManager.getInstance().getSelfId())
        ? this.player1Board : this.player2Board,
    };
  }

  nextTurn() {
    this.turn = (this.turn === this.player1) ? this.player2 : this.player1;
    this.titleBoard.setState(this.isTurn(PlayerManager.getInstance().getSelfId()) ? 1 : 2);
    this.shots = [];
    this.titleBoard.updateShots(this.resolveBoards().myBoard.getShipsAlive());
  }

  checkWin() {
    if (this.player1Board.getShipsAlive() === 0) {
      return 1;
    }
    if (this.player2Board.getShipsAlive() === 0) {
      return 2;
    }
    return 0;
  }

  sendNetworkUpdate(data) {
    const dataToSend = data;
    dataToSend.gameName = this.gameName;
    dataToSend.lobbyId = this.lobbyId;
    dataToSend.state = this.getState();
    dataToSend.from = PlayerManager.getInstance().getSelfId();
    dataToSend.player1 = this.player1;
    dataToSend.player2 = this.player2;

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
