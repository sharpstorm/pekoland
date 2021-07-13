import CheckerPiece from './checker-piece.js';
import GridBox from './grid-box.js';
import SpriteManager from '../../managers/sprite-manager.js';

const BOARD_SIZE = 800;
const PANEL_SIZE = 900;
const ANIMATION_DELTA = 0.02;

export default class CheckerBoard {
  constructor(player1, player2, flipped) {
    this.player1 = player1;
    this.player2 = player2;
    this.flipped = flipped;

    this.gridArray = [];
    this.selectedGrid = undefined;
    this.currentTurn = this.player1;

    // Animation Helpers
    this.animation = undefined;
    this.animationCallback = undefined;

    this.setUp();
  }

  setUp() {
    const unit = BOARD_SIZE / 8;
    for (let y = 0; y < 8; y += 1) {
      for (let x = 0; x < 8; x += 1) {
        if ((y % 2) === (x % 2)) {
          if (y < 3) {
            this.gridArray.push(new GridBox(GridBox.State.UNSELECTED, new CheckerPiece(1), unit));
          } else if (y > 4) {
            this.gridArray.push(new GridBox(GridBox.State.UNSELECTED, new CheckerPiece(2), unit));
          } else {
            this.gridArray.push((new GridBox(GridBox.State.UNSELECTED, undefined, unit)));
          }
        } else {
          this.gridArray.push((new GridBox(GridBox.State.UNSELECTED, undefined, unit)));
        }
      }
    }
    // console.log(this.gridArray);
    this.gridArray.forEach((grid, idx) => grid.setIndex(idx));
  }

  drawBoard(ctx, camContext) {
    const unit = BOARD_SIZE / 8;
    const panelX = (camContext.viewportWidth / 2 - (BOARD_SIZE / 2))
      - ((PANEL_SIZE - BOARD_SIZE) / 2);
    const panelY = (camContext.viewportHeight / 2 - (BOARD_SIZE / 2))
      - ((PANEL_SIZE - BOARD_SIZE) / 2);
    SpriteManager.getInstance().getSprite('panel').drawAt(ctx, panelX, panelY, PANEL_SIZE, PANEL_SIZE);

    let xResolver;
    let yResolver;

    if (!this.flipped) {
      // Reference coordinate is bottom left
      const baseX = (camContext.viewportWidth / 2 - (BOARD_SIZE / 2));
      const baseY = (camContext.viewportHeight / 2 + (BOARD_SIZE / 2));
      xResolver = (a) => baseX + (a * unit);
      yResolver = (a) => baseY - ((a + 1) * unit); // +1 because canvas reference is top left
    } else {
      // Reference coordinate is top right
      const baseX = (camContext.viewportWidth / 2 + (BOARD_SIZE / 2));
      const baseY = (camContext.viewportHeight / 2 - (BOARD_SIZE / 2));
      xResolver = (a) => baseX - ((a + 1) * unit); // +1 because canvas reference is top right
      yResolver = (a) => baseY + (a * unit);
    }

    for (let i = 0; i < 8; i += 1) {
      for (let j = 0; j < 8; j += 1) {
        this.getGridAtCoord(j, i).drawAt(ctx, xResolver(j), yResolver(i));
      }
    }

    if (this.animation !== undefined) {
      const fromX = xResolver(this.animation.from.x);
      const fromY = yResolver(this.animation.from.y);
      const toX = xResolver(this.animation.to.x);
      const toY = yResolver(this.animation.to.y);
      const deltaX = Math.floor((toX - fromX) * this.animation.progress);
      const deltaY = Math.floor((toY - fromY) * this.animation.progress);

      const x = fromX + deltaX;
      const y = fromY + deltaY;
      this.animation.piece.drawAt(ctx, x, y);

      this.animation.progress += ANIMATION_DELTA;
      if (this.animation.progress > 1) {
        // End of animation
        this.animation = undefined;
        if (this.animationCallback !== undefined) {
          this.animationCallback();
          this.animationCallback = undefined;
        }
      }
    }
  }

  isPlaying(playerId) {
    return this.player1 === playerId || this.player2 === playerId;
  }

  isTurn(playerId) {
    return this.currentTurn === playerId;
  }

  getPlayerNum(playerId) {
    if (this.player1 === playerId) {
      return 1;
    // eslint-disable-next-line no-else-return
    } else if (this.player2 === playerId) {
      return 2;
    }
    return 0;
  }

  getOpponent(playerId) {
    if (this.player1 === playerId) {
      return this.player2;
    }
    if (this.player2 === playerId) {
      return this.player1;
    }
    return undefined;
  }

  selectGrid(selectedGrid) {
    this.selectedGrid = selectedGrid;
  }

  move(newGrid, callback) {
    if (newGrid.getState() === GridBox.State.SELECTABLE) {
      const oldCoord = this.selectedGrid.getCoordinates();
      const newCoord = newGrid.getCoordinates();
      const piece = this.selectedGrid.getPiece();

      let king;
      let remove;

      if (Math.abs(oldCoord.y - newCoord.y) > 1) {
        // Piece will be eaten
        const eatY = (newCoord.y - oldCoord.y > 0) ? (oldCoord.y + 1) : (oldCoord.y - 1);
        const eatX = (newCoord.x - oldCoord.x > 0) ? (oldCoord.x + 1) : (oldCoord.x - 1);
        const deadIdx = (eatY * 8) + eatX;
        this.gridArray[deadIdx].removePiece();
        remove = deadIdx;
      }

      // Kinging
      if ((newCoord.y === 7 && piece.getPlayer() === 1)
        || (newCoord.y === 0 && piece.getPlayer() === 2)) {
        king = true;
      }

      this.animatedMove(this.selectedGrid, newGrid, () => {
        if (king) {
          piece.setKing(true);
        }
        if (callback !== undefined) {
          callback();
        }
      });

      const from = this.selectedGrid.index;
      this.unsetBoard();
      this.nextTurn();
      return {
        from,
        to: newGrid.index,
        remove,
        k: king,
      };
    }
    return undefined;
  }

  animatedMove(fromGrid, toGrid, callback) {
    const piece = fromGrid.getPiece();

    if (this.animation !== undefined) {
      // Fast Forward
      fromGrid.movePieceTo(toGrid);
    } else {
      // Remove from source grid so both are empty
      fromGrid.removePiece();
      this.animation = {
        from: fromGrid.getCoordinates(),
        to: toGrid.getCoordinates(),
        piece,
        progress: 0,
      };
      this.animationCallback = () => {
        toGrid.assignPiece(piece);
        if (callback !== undefined) {
          callback();
        }
      };
    }
  }

  isAnimating() {
    return this.animation !== undefined;
  }

  getGridAtScreenCoord(x, y, viewportWidth, viewportHeight) {
    const baseX = (viewportWidth / 2 - (BOARD_SIZE / 2));
    const baseY = (viewportHeight / 2 + (BOARD_SIZE / 2));

    if (x < baseX || x > baseX + BOARD_SIZE || y < baseY - BOARD_SIZE || y > baseY) {
      return undefined;
    }

    const unit = BOARD_SIZE / 8;
    if (!this.flipped) {
      const xIdx = Math.floor((x - baseX) / unit);
      const yIdx = Math.floor((baseY - y) / unit);

      return this.getGridAtCoord(xIdx, yIdx);
    }

    const xIdx = 7 - Math.floor((x - baseX) / unit);
    const yIdx = 7 - Math.floor((baseY - y) / unit);

    return this.getGridAtCoord(xIdx, yIdx);
  }

  getGridAtCoord(x, y) {
    return this.gridArray[(y * 8) + x];
  }

  getGridAtIndex(idx) {
    return this.gridArray[idx];
  }

  nextTurn() {
    this.currentTurn = (this.currentTurn === this.player1) ? this.player2 : this.player1;
  }

  unsetBoard() {
    this.gridArray.forEach((grid) => grid.setState(GridBox.State.UNSELECTED));
    this.selectedGrid = undefined;
  }

  isEnemy(index, selfPlayerNum) {
    return this.gridArray[index].checkerPiece.getPlayer() !== selfPlayerNum;
  }

  checkWin() {
    let p1 = false;
    let p2 = false;
    this.gridArray.forEach((grid) => {
      if (grid.hasPiece()) {
        if (grid.checkerPiece.getPlayer() === 1) {
          p1 = true;
        } else if (grid.checkerPiece.getPlayer() === 2) {
          p2 = true;
        }
      }
    });
    if (!p1) {
      alert('Player 2 wins');
    } else if (!p2) {
      alert('Player 1 wins');
    }
  }

  getMoveInDirection(x, y, directionX, directionY, playerNum) {
    let ret;
    const newGrid = this.getGridAtCoord(x + directionX, y + directionY);
    if (!newGrid.hasPiece()) { // Open square
      ret = newGrid;
    } else if (newGrid.getPiece().getPlayer() !== playerNum) {
      const futureX = x + directionX * 2;
      const futureY = y + directionY * 2;
      if (futureX >= 0 && futureX <= 7 && futureY >= 0 && futureY <= 7) { // Not Out of Bounds
        const futureGrid = this.getGridAtCoord(futureX, futureY);
        if (!futureGrid.hasPiece()) {
          ret = futureGrid;
        }
      }
    }
    return ret;
  }

  highlightMoves(grid, playerNum) {
    if (!grid.hasPiece() || grid.getPiece().getPlayer() !== playerNum) {
      return 0; // Not My Piece
    }

    const coord = grid.getCoordinates();
    let moves = 0;
    const deltaY = (playerNum === 1) ? 1 : -1;

    // Do forward checks
    const futureY = coord.y + deltaY;
    if (futureY >= 0 && futureY <= 7) {
      // Can do forward move
      if (coord.x > 0) {
        // Can Move x-
        const box = this.getMoveInDirection(coord.x, coord.y, -1, deltaY, playerNum);
        if (box !== undefined) {
          box.setState(GridBox.State.SELECTABLE);
          moves += 1;
        }
      }

      if (coord.x < 7) {
        // Can Move x+
        const box = this.getMoveInDirection(coord.x, coord.y, 1, deltaY, playerNum);
        if (box !== undefined) {
          box.setState(GridBox.State.SELECTABLE);
          moves += 1;
        }
      }
    }

    // Do backward check
    if (grid.getPiece().isKing()) {
      const backwardY = coord.y - deltaY;
      if (backwardY >= 0 && backwardY <= 7) {
        // Can do backwards move
        if (coord.x > 0) {
          // Can Move x-
          const box = this.getMoveInDirection(coord.x, coord.y, -1, -deltaY, playerNum);
          if (box !== undefined) {
            box.setState(GridBox.State.SELECTABLE);
            moves += 1;
          }
        }

        if (coord.x < 7) {
          // Can Move x+
          const box = this.getMoveInDirection(coord.x, coord.y, 1, -deltaY, playerNum);
          if (box !== undefined) {
            box.setState(GridBox.State.SELECTABLE);
            moves += 1;
          }
        }
      }
    }
    return moves;
  }

  getState() {
    return {
      board: this.gridArray.map((grid) => {
        const ret = { state: grid.getState() };
        if (grid.hasPiece()) {
          ret.p = {
            k: grid.getPiece().isKing(),
            p: grid.getPiece().getPlayer(),
          };
        } else if (this.isAnimating()) {
          const gridCoord = grid.getCoordinates();
          if (gridCoord.x === this.animation.to.x
            && gridCoord.y === this.animation.to.y) {
            ret.p = {
              k: this.animation.piece.isKing(),
              p: this.animation.piece.getPlayer(),
            };
          }
        }
        return ret;
      }),
      turn: this.currentTurn,
    };
  }

  inflateState(data) {
    if (data === undefined || data === null) {
      return;
    }
    data.board.forEach((x, idx) => {
      const grid = this.gridArray[idx];
      grid.setState(x.state);
      if (x.p) {
        const piece = new CheckerPiece(x.p.p);
        piece.setKing(x.p.k);
        grid.assignPiece(piece);
      } else {
        grid.removePiece();
      }
    });
    this.currentTurn = data.turn;
  }
}
