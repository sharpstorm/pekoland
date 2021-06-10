import CheckerBoard from './CheckerBoard.js';
import NetworkManager from '../net/network-manager.js';
import buildClientGamePacket from './client/game-data-sender.js';

let checkersEventHandler = [];
let aa = new CheckerBoard(1, 2);

function checkersMouseClick(e) {
  const clickedGrid = aa.getGridIndex(e.pageX, e.pageY);
  if (clickedGrid !== undefined) {
    aa.selectedGrid = clickedGrid;
    const action = aa.move();
    if (action !== undefined) {
      NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('checkers-echo', data, conn.peer));
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
  aa = new CheckerBoard(player1, player2);
}

export default function drawChecker(ctx, uiState) {
  aa.setUp(uiState);
  aa.drawBoard(ctx, uiState);
}

document.addEventListener('click', checkersMouseClick);

export { drawChecker, checkersMouseClick, startGame };
