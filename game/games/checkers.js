/* eslint-disable class-methods-use-this */
import CheckerBoard from './checker-board.js';
import NetworkManager from '../net/network-manager.js';
import PlayerManager from '../managers/player-manager.js';
import buildClientGamePacket from '../net/client/game-data-sender.js';

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
      const clickedGrid = checkersInstance.checkersBoard.getGridIndex(e.pageX, e.pageY);
      if (clickedGrid !== undefined) {
        checkersInstance.checkersBoard.selectedGrid = clickedGrid;
        const move = checkersInstance.checkersBoard.move();
        if (move !== undefined) {
          const data = {
            from: PlayerManager.getInstance().getSelfId(),
            player1: checkersInstance.checkersBoard.player1,
            player2: checkersInstance.checkersBoard.player2,
            action: move,
          };
          NetworkManager.getInstance().send(buildClientGamePacket('checkers', data));
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

  checkersMove(data) {
    if (data.action === 'startGame') {
      if (PlayerManager.getInstance().getSelfId() === data.player1
      || PlayerManager.getInstance().getSelfId() === data.player2) {
        this.gameOn = true;
        this.checkersBoard = new CheckerBoard(data.player1, data.player2);
      }
    } else if (data.from !== PlayerManager.getInstance().getSelfId()) {
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
    console.log(this);
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
