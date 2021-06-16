/* eslint-disable class-methods-use-this */
import CheckerBoard from './checker-board.js';
import NetworkManager from '../net/network-manager.js';
import PlayerManager from '../managers/player-manager.js';
import buildClientGamePacket from '../net/client/game-data-sender.js';
import WorldManager from '../managers/world-manager.js'; // TO FIX

let instance;

export default class CheckersGame {
  constructor() {
    this.checkersBoard = undefined;
    this.gameName = 'Checkers';
    this.gameOn = false;
    document.addEventListener('click', this.checkersMouseClick);
  }

  checkersMouseClick(e) {
    if (CheckersGame.getInstance().checkersBoard !== undefined) {
      const checkersInstance = CheckersGame.getInstance();
      if (checkersInstance.checkersBoard.player1 === PlayerManager.getInstance().getSelfId()
      || checkersInstance.checkersBoard.player2 === PlayerManager.getInstance().getSelfId()) {
        const clickedGrid = checkersInstance.checkersBoard.getGridIndex(e.pageX, e.pageY);
        if (clickedGrid !== undefined) {
          checkersInstance.checkersBoard.selectedGrid = clickedGrid;
          const move = checkersInstance.checkersBoard.move();
          if (move !== undefined) {
            let data = {
              from: PlayerManager.getInstance().getSelfId(),
              player1: checkersInstance.checkersBoard.player1,
              player2: checkersInstance.checkersBoard.player2,
              action: move,
            };
            NetworkManager.getInstance().send(buildClientGamePacket('checkers', data));

            if (NetworkManager.getInstance().getOperationMode() === 2) {
              data = {
                host: PlayerManager.getInstance().getSelfId(),
                joiner: checkersInstance.checkersBoard.player2,
                action: { history: move },
              };
              NetworkManager.getInstance().send(buildClientGamePacket('gameLobby', data));
            } else if (NetworkManager.getInstance().getOperationMode() === 1) {
              data = {
                host: checkersInstance.checkersBoard.player1,
                joiner: checkersInstance.checkersBoard.player2,
                action: { history: move },
              };
              WorldManager.getInstance().addHistory(data.host, data);
            }
          }
          checkersInstance.checkersBoard.resetBoard();
          if (checkersInstance.checkersBoard.selectedGrid.hasPiece) {
            checkersInstance.checkersBoard.selectedPiece = checkersInstance
              .checkersBoard.selectedGrid;
          }
          checkersInstance.checkersBoard.highlightMoves();
          checkersInstance.checkersBoard.checkWin();
        }
      }
    }
  }

  endGame() {
    this.gameOn = false;
  }

  startGame(p1, p2) {
    this.gameOn = true;
    this.checkersBoard = new CheckerBoard(p1, p2);
    const data = {
      from: PlayerManager.getInstance().getSelfId(),
      player1: p1,
      player2: p2,
      action: 'startGame',
    };
    // TO CHECK. MAYBE MOVE IT UP
    NetworkManager.getInstance().send(buildClientGamePacket('checkers', data));
  }

  spectateGame(p1, p2) {
    this.gameOn = true;
    this.checkersBoard = new CheckerBoard(p1, p2);
  }

  checkersMove(data) {
    console.log(data);
    if (data.action === 'startGame') {
      if (PlayerManager.getInstance().getSelfId() === data.player1
      || PlayerManager.getInstance().getSelfId() === data.player2) {
        this.gameOn = true;
        if (PlayerManager.getInstance().getSelfId() === data.player1) {
          this.checkersBoard = new CheckerBoard(data.player1, data.player2);
        } else {
          this.checkersBoard = new CheckerBoard(data.player2, data.player1);
        }
      }
    } else if (this.gameOn) {
      if (data.player1 === PlayerManager.getInstance().getSelfId()
      || data.player2 === PlayerManager.getInstance().getSelfId()) {
        if (data.from === this.checkersBoard.player2) {
          this.checkersBoard.gridArray[63 - data.action.from]
            .movePieceTo(this.checkersBoard.gridArray[63 - data.action.to]);
          this.checkersBoard.currentTurn = PlayerManager.getInstance().getSelfId();
          if (data.action.remove !== undefined) {
            this.checkersBoard.gridArray[63 - data.action.remove].removePiece();
          }
          if (data.action.k) {
            this.checkersBoard.gridArray[63 - data.action.to].checkerPiece.isKing = true;
          }
        }
      }
    }
    console.log(this);
  }

  processMove(data) {
    if (this.checkersBoard.gridArray[0] !== undefined) {
      console.log(data);
      console.log(this.checkersBoard);
      if (data.host === this.checkersBoard.player2) {
        console.log(data.action.history.from);
        console.log(this.checkersBoard);
        console.log(this.checkersBoard.gridArray[44]);
        console.log(this.checkersBoard.gridArray[63 - data.action.history.from]);
        console.log(this.checkersBoard.gridArray);
        console.log(this.checkersBoard.gridArray[0]);
        this.checkersBoard.gridArray[63 - data.action.history.from]
          .movePieceTo(this.checkersBoard.gridArray[63 - data.action.history.to]);
        if (data.action.history.remove !== undefined && data.action.history.remove !== null) {
          this.checkersBoard.gridArray[63 - data.action.history.remove].removePiece();
        }
        if (data.action.history.k) {
          this.checkersBoard.gridArray[63 - data.action.history.to].checkerPiece.isKing = true;
        }
      } else if (data.host === this.checkersBoard.player1) {
        this.checkersBoard.gridArray[data.action.history.from]
          .movePieceTo(this.checkersBoard.gridArray[data.action.history.to]);
        console.log(data);
        if (data.action.history.remove !== undefined && data.action.history.remove !== null) {
          this.checkersBoard.gridArray[data.action.history.remove].removePiece();
        }
        if (data.action.history.k) {
          this.checkersBoard.gridArray[data.action.history.to].checkerPiece.isKing = true;
        }
      }
    }
  }

  draw(ctx, camContext) {
    if (this.gameOn) {
      this.checkersBoard.setUp(camContext);
      this.checkersBoard.drawBoard(ctx);
    }
  }

  static getInstance() {
    if (instance === undefined) {
      instance = new CheckersGame();
    }
    return instance;
  }
}
