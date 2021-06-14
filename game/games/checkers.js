import CheckerBoard from './CheckerBoard.js';
import NetworkManager from '../net/network-manager.js';
import PlayerManager from '../managers/player-manager.js';
import buildClientGamePacket from '../net/client/game-data-sender.js';

let aa = new CheckerBoard('Player 1', 'Player 2');
let gameOn = false;

function checkersMouseClick(e) {
  const clickedGrid = aa.getGridIndex(e.pageX, e.pageY);
  if (clickedGrid !== undefined) {
    aa.selectedGrid = clickedGrid;
    const move = aa.move();
    if (move !== undefined) {
      const data = {
        from: PlayerManager.getInstance().getSelfId(),
        player1: aa.player1,
        player2: aa.player2,
        action: move,
      };
      NetworkManager.getInstance().send(buildClientGamePacket('checkers', data));
    }
    aa.resetBoard();
    if (aa.selectedGrid.hasPiece) {
      aa.selectedPiece = aa.selectedGrid;
    }
    aa.highlightMoves();
    aa.checkWin();
  }
}

function startGame(player1, player2) {
  gameOn = true;
  aa = new CheckerBoard(player1, player2);
  const data = {
    from: PlayerManager.getInstance().getSelfId(),
    player1: aa.player1,
    player2: aa.player2,
    action: 'startGame',
  };
  NetworkManager.getInstance().send(buildClientGamePacket('checkers', data));
}

function checkersMove(data) {
  if (data.action === 'startGame') {
    if (PlayerManager.getInstance().getSelfId() === data.player1
    || PlayerManager.getInstance().getSelfId() === data.player2) {
      gameOn = true;
      aa = new CheckerBoard(data.player1, data.player2);
    }
  }
  if (data.from !== PlayerManager.getInstance().getSelfId()) {
    aa.gridArray[63 - data.action.from].movePieceTo(aa.gridArray[63 - data.action.to]);
    aa.currentTurn = PlayerManager.getInstance().getSelfId();
    if (data.action.remove !== undefined) {
      aa.gridArray[63 - data.action.remove].removePiece();
    }
    if (data.action.k) {
      console.log('here');
      aa.gridArray[63 - data.action.to].checkerPiece.isKing = true;
    }
  }
}

export default function drawChecker(ctx, camContext) {
  if (gameOn) {
    aa.setUp(camContext);
    aa.drawBoard(ctx);
  }
}

document.addEventListener('click', checkersMouseClick);

export {
  drawChecker, checkersMouseClick, startGame, checkersMove,
};
