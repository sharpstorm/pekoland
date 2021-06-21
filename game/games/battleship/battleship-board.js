import SpriteManager from '../../managers/sprite-manager.js';

const SIZE_CHART = [5, 4, 3, 3, 2];
const SPRITES = ['battleship-cv', 'battleship-bb', 'battleship-cl', 'battleship-dd', 'battleship-ao'];
const ORIENTATION = {
  ORIENT_HORI: 0,
  ORIENT_VERT: 1,
};
const STATE = {
  EMPTY: 0,
  AIM: 1,
  MISS: 2,
  HIT: 3,
};

class Ship {
  constructor(type, x, y, orient) { // Anchor Top Left
    this.type = type;
    this.x = x;
    this.y = y;
    this.orient = orient;
  }

  isInBox(x, y) {
    if (this.orient === ORIENTATION.ORIENT_HORI) {
      if (y !== this.y) { // Short Circuit
        return false;
      }
      return x >= this.x && x < this.x + SIZE_CHART[this.type];
    }

    // ORIENT_VERT
    if (x !== this.x) {
      return false;
    }
    return y >= this.y && y < this.y + SIZE_CHART[this.type];
  }

  getBoxes() {
    const boxes = [];
    if (this.orient === ORIENTATION.ORIENT_HORI) {
      for (let i = 0; i < SIZE_CHART[this.type]; i += 1) {
        boxes.push({
          x: this.x + i,
          y: this.y,
        });
      }
    } else {
      for (let i = 0; i < SIZE_CHART[this.type]; i += 1) {
        boxes.push({
          x: this.x,
          y: this.y + i,
        });
      }
    }

    return boxes;
  }

  flatten() {
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      orient: this.orient,
    };
  }

  update(data) {
    this.type = data.type;
    this.x = data.x;
    this.y = data.y;
    this.orient = data.orient;
  }

  static inflate(data) {
    return new Ship(data.type, data.x, data.y, data.orient);
  }
}

class BoardState {
  constructor() {
    this.initBoard();

    this.ships = [undefined, undefined, undefined, undefined, undefined];
  }

  initBoard() {
    this.state = [];

    for (let i = 0; i < 10; i += 1) {
      const col = [];
      for (let j = 0; j < 10; j += 1) {
        col.push(STATE.EMPTY);
      }
      this.state.push(col);
    }
  }

  resetBoard() {
    for (let i = 0; i < 10; i += 1) {
      for (let j = 0; j < 10; j += 1) {
        this.state[j][i] = STATE.EMPTY;
      }
    }
  }

  setCellState(x, y, state) {
    this.state[x][y] = state;
  }

  getCellState(x, y) {
    return this.state[x][y];
  }

  addShip(ship) {
    if (ship.type === undefined || ship.type < 0 || ship.type > 4) {
      return false;
    }
    if (((ship.orient === ORIENTATION.ORIENT_HORI) && (ship.x + SIZE_CHART[ship.type] > 10))
      || ((ship.orient === ORIENTATION.ORIENT_VERT) && (ship.y + SIZE_CHART[ship.type] > 10))) {
      // Out of Bounds
      return false;
    }

    this.ships[ship.type] = ship;
    return true;
  }

  removeShip(shipType) {
    if (shipType < 0 || shipType > 4) {
      return;
    }

    this.ships[shipType] = undefined;
  }

  getShipsAlive() {
    return this.ships.filter((x) => x !== undefined).length;
  }

  updateShipsAlive() {
    this.ships = this.ships.map((x) => {
      if (x === undefined) {
        return undefined;
      }
      const aliveBoxes = x.getBoxes()
        .filter((box) => this.getCellState(box.x, box.y) !== STATE.HIT);
      if (aliveBoxes.length === 0) {
        return undefined;
      }
      return x;
    });
  }

  getShipAt(x, y) {
    const hitTest = this.ships.filter((ship) => {
      if (ship === undefined) {
        return false;
      }
      return ship.isInBox(x, y);
    });
    if (hitTest.length > 0) {
      return hitTest[0];
    }
    return undefined;
  }

  validatePlacement() {
    return this.ships
      .reduce((state, curShip) => {
        if (!state.valid) {
          return state;
        }
        if (curShip === undefined) {
          return { valid: false, occupied: [] };
        }

        const valid = state.occupied
          .map((box) => curShip.isInBox(box.x, box.y))
          .filter((x) => x === true).length === 0;

        if (!valid) {
          return { valid: false, occupied: [] };
        }

        return { valid: true, occupied: state.occupied.concat(curShip.getBoxes()) };
      }, { valid: true, occupied: [] }).valid;
  }

  flatten() {
    return {
      ships: this.ships.map((x) => ((x === undefined) ? x : x.flatten())),
      state: this.state,
    };
  }

  inflate(data) {
    this.state = data.state;
    for (let i = 0; i < 5; i += 1) {
      if (data.ships[i]) {
        if (this.ships[i] === undefined) {
          this.ships[i] = Ship.inflate(data.ships[i]);
        } else {
          this.ships[i].update(data.ships[i]);
        }
      } else {
        this.ships[i] = undefined;
      }
    }
  }

  drawShips(ctx, x, y, cellSize, padding) {
    this.ships.forEach((ship) => {
      if (ship !== undefined) {
        const sprite = SpriteManager.getInstance().getSprite(SPRITES[ship.type]
          + ((ship.orient === ORIENTATION.ORIENT_VERT) ? '-90' : ''));
        const width = (ship.orient === ORIENTATION.ORIENT_HORI) ? SIZE_CHART[ship.type] : 1;
        const height = (ship.orient === ORIENTATION.ORIENT_VERT) ? SIZE_CHART[ship.type] : 1;

        sprite.drawAt(ctx, x + (ship.x * cellSize) + padding, y + (ship.y * cellSize) + padding,
          width * cellSize, height * cellSize);
      }
    });
  }
}

export default class BattleshipBoard {
  constructor(hideShips) {
    this.hideShips = hideShips;

    this.shipsPlaced = false;
    this.cache = document.createElement('canvas');
    this.cacheContext = this.cache.getContext('2d');
    this.boardSprite = SpriteManager.getInstance().getSprite('battleship-board');
    this.lastDrawnSize = -1;
    this.canvasDirty = false;

    this.boardState = new BoardState();
  }

  addShip(shipType, x, y, orient) {
    this.canvasDirty = true;
    return this.boardState.addShip(new Ship(shipType, x, y, orient));
  }

  getShipsAlive() {
    return this.boardState.getShipsAlive();
  }

  updateAlive() {
    this.boardState.updateShipsAlive();
    this.canvasDirty = true;
  }

  getGridAtPosition(x, y, boardSize) {
    const { padding, cellSize } = this.getDrawParams(boardSize);
    if (x < padding || y < padding) {
      return undefined;
    }
    return {
      x: Math.floor((x - padding) / cellSize),
      y: Math.floor((y - padding) / cellSize),
    };
  }

  setGridStateAtPosition(x, y, state) {
    this.boardState.setCellState(x, y, state);
    this.canvasDirty = true;
  }

  getGridStateAtPosition(x, y) {
    return this.boardState.getCellState(x, y);
  }

  validatePlacement() {
    return this.boardState.validatePlacement();
  }

  fireAt(x, y) {
    this.canvasDirty = true;

    const hit = this.boardState.getShipAt(x, y);
    if (hit !== undefined) {
      this.boardState.setCellState(x, y, STATE.HIT);
      return true;
    }
    this.boardState.setCellState(x, y, STATE.MISS);
    return false;
  }

  isHit(x, y) {
    return this.boardState.getShipAt(x, y) !== undefined;
  }

  setShipsPlaced(isSet) {
    this.shipsPlaced = isSet;
  }

  isShipsPlaced() {
    return this.shipsPlaced;
  }

  getState() {
    return {
      board: this.boardState.flatten(),
      fixed: this.shipsPlaced,
    };
  }

  updateState(state) {
    this.boardState.inflate(state.board);
    this.shipsPlaced = state.fixed;
    this.canvasDirty = true;
  }

  // eslint-disable-next-line class-methods-use-this
  getDrawParams(size) {
    const cellSize = Math.floor(size / 11);
    const padding = Math.floor((size - (cellSize * 10)) * 0.69);
    return { cellSize, padding };
  }

  draw(ctx, x, y, size) {
    const { padding, cellSize } = this.getDrawParams(size);

    if (this.lastDrawnSize !== size || this.canvasDirty) {
      this.cache.width = size;
      this.cache.height = size;
      const cacheCtx = this.cacheContext;

      cacheCtx.clearRect(0, 0, size, size);
      this.boardSprite.drawAt(cacheCtx, 0, 0, size, size);

      cacheCtx.strokeStyle = '#000';
      for (let j = 0; j < 10; j += 1) {
        for (let i = 0; i < 10; i += 1) {
          const state = this.boardState.getCellState(i, j);
          if (state !== STATE.EMPTY) {
            if (state === STATE.AIM) {
              cacheCtx.fillStyle = 'gold';
            } else if (state === STATE.MISS) {
              cacheCtx.fillStyle = 'red';
            } else if (state === STATE.HIT) {
              cacheCtx.fillStyle = 'DarkGreen';
            }

            cacheCtx.beginPath();
            cacheCtx.rect(padding + (i * cellSize), padding + (j * cellSize), cellSize, cellSize);
            cacheCtx.stroke();
            cacheCtx.fill();
          }
        }
      }

      if (!this.hideShips) {
        this.boardState.drawShips(cacheCtx, 0, 0, cellSize, padding);
      }

      this.canvasDirty = false;
      this.lastDrawnSize = size;
    }
    ctx.drawImage(this.cache, x, y);
  }
}

BattleshipBoard.SHIPTYPE = {
  CARRIER: 0,
  BATTLESHIP: 1,
  CRUISER: 2,
  DESTROYER: 3,
  OILER: 4,
};

BattleshipBoard.ORIENTATION = ORIENTATION;
BattleshipBoard.STATE = STATE;
