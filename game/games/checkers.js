/* eslint-disable class-methods-use-this */
import CheckerBoard from './checker-board.js';
import NetworkManager from '../net/network-manager.js';
import PlayerManager from '../managers/player-manager.js';
import buildClientGamePacket from '../net/client/game-data-sender.js';
import buildServerGamePacket from '../net/server/game-data-sender.js';
import GridBox from './grid-box.js';

export default class CheckersGame {
  constructor() {
    this.checkersBoard = undefined;
    this.gameName = 'Checkers';
    this.gameOn = false;
  }

  handleEvent(evtId, e, camContext) {
    if (evtId === 'click' && this.checkersBoard !== undefined) {
      const checkerBoard = this.checkersBoard;
      const selfId = PlayerManager.getInstance().getSelfId();
      if (checkerBoard.isPlaying(selfId) && checkerBoard.isTurn(selfId)) {
        const clickedGrid = checkerBoard.getGridAtScreenCoord(e.clientX, e.clientY,
          camContext.viewportWidth, camContext.viewportHeight);

        if (clickedGrid !== undefined) {
          if (clickedGrid.getState() === GridBox.State.SELECTABLE) {
            const move = checkerBoard.move(clickedGrid);
            const data = {
              from: PlayerManager.getInstance().getSelfId(),
              player1: checkerBoard.player1,
              player2: checkerBoard.player2,
              action: move,
            };

            this.sendNetworkUpdate(data);
            checkerBoard.checkWin();
          } else {
            checkerBoard.unsetBoard();
            if (clickedGrid.hasPiece()) {
              if (checkerBoard.highlightMoves(clickedGrid, checkerBoard.getPlayerNum(selfId)) > 0) {
                checkerBoard.selectGrid(clickedGrid);
              }
            }
          }
        }
      }
    }
  }

  sendNetworkUpdate(data) {
    const dataToSend = data;
    dataToSend.gameName = this.gameName;
    dataToSend.lobbyId = this.lobbyId;

    if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.CLIENT) {
      NetworkManager.getInstance().send(buildClientGamePacket('game-update', data));
    } else if (NetworkManager.getInstance().getOperationMode() === NetworkManager.Mode.SERVER) {
      NetworkManager.getInstance().send(buildServerGamePacket('game-update-echo', data));
    }
  }

  startGame(p1, p2, lobbyId) {
    const selfId = PlayerManager.getInstance().getSelfId();

    if (selfId === p1 || selfId === p2) {
      this.gameOn = true;
      this.lobbyId = lobbyId;
      if (selfId === p1) {
        this.checkersBoard = new CheckerBoard(p1, p2, false);
      } else {
        this.checkersBoard = new CheckerBoard(p1, p2, true);
      }
    }
  }

  endGame() {
    this.gameOn = false;
    this.lobbyId = undefined;
  }

  spectateGame(p1, p2, lobbyId) {
    this.lobbyId = lobbyId;
    this.gameOn = true;
    this.checkersBoard = new CheckerBoard(p1, p2, false);
  }

  handleNetworkEvent(data) {
    console.log(data);
    const checkerBoard = this.checkersBoard;
    if (this.gameOn && checkerBoard !== undefined && this.lobbyId === data.lobbyId) {
      if (checkerBoard.isTurn(data.from)) {
        checkerBoard.getGridAtIndex(data.action.from)
          .movePieceTo(this.checkersBoard.getGridAtIndex(data.action.to));
        this.checkersBoard.nextTurn();
        if (data.action.remove) {
          this.checkersBoard.getGridAtIndex(data.action.remove).removePiece();
        }
        if (data.action.k) {
          this.checkersBoard.getGridAtIndex(data.action.to).getPiece().setKing(true);
        }
      }
      checkerBoard.checkWin();
    }
  }

  draw(ctx, camContext) {
    if (this.gameOn) {
      this.checkersBoard.drawBoard(ctx, camContext);
    }
  }
}
