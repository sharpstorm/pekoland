import PlayerManager from '../managers/player-manager.js';
import CheckerPiece from './checker-piece.js';
import GridBox from './grid-box.js';

export default class Board {
  constructor(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
    this.gridArray = [];
    this.set = false;
    this.selectedGrid = undefined;
    this.selectedPiece = undefined;
    this.currentTurn = this.player1;
    this.opponent = undefined;
    this.me = undefined;
    this.setUp();
  }

  drawBoard(ctx) {
    ctx.beginPath();
    this.gridArray.forEach((grid) => grid.drawAt(ctx));
  }

  gridArrayInit() {
    let i;
    for (i = 0; i < 64; i += 1) {
      this.gridArray.push(new GridBox(0, 0, 'white', undefined, false));
    }
  }

  move() {
    let f;
    let t;
    let dead;
    let king = false;
    if (this.selectedGrid.color === 'green') {
      this.selectedPiece.movePieceTo(this.selectedGrid);
      const indexDiff = this.selectedGrid.index - this.selectedPiece.index;
      if (this.currentTurn === this.me
        || (this.currentTurn === this.me && this.selectedGrid.checkerPiece.isKing)) {
        if (indexDiff === 14) {
          this.gridArray[this.selectedPiece.index + 7].removePiece();
          dead = this.selectedPiece.index + 7;
        } else if (indexDiff === 18) {
          this.gridArray[this.selectedPiece.index + 9].removePiece();
          dead = this.selectedPiece.index + 9;
        }
        if (this.isAtEnd() === 1 && !this.selectedGrid.checkerPiece.isKing) {
          this.selectedGrid.checkerPiece.isKing = true;
          king = true;
        }
      }
      if ((this.currentTurn === this.me && this.selectedGrid.checkerPiece.isKing)
      || this.currentTurn === this.me) {
        if (indexDiff === -14) {
          this.gridArray[this.selectedPiece.index - 7].removePiece();
          dead = this.selectedPiece.index - 7;
        } else if (indexDiff === -18) {
          this.gridArray[this.selectedPiece.index - 9].removePiece();
          dead = this.selectedPiece.index - 9;
        }
        if (this.isAtEnd() === 1 && !this.selectedGrid.checkerPiece.isKing) {
          this.selectedGrid.checkerPiece.isKing = true;
          king = true;
        }
      }
      f = this.selectedPiece.index;
      t = this.selectedGrid.index;
      // console.log(`from: ${f}`);
      // console.log(`to: ${t}`);
      this.resetBoard();
      this.nextTurn();
      return {
        from: f,
        to: t,
        remove: dead,
        k: king,
      };
    }
    return undefined;
  }

  isAtEnd() {
    if (this.currentTurn === this.player2) {
      if (this.selectedGrid.index - 8 < 0 || this.selectedGrid.index + 8 > 63) {
        return 1;
      }
    } else if (this.currentTurn === this.player1) {
      if (this.selectedGrid.index - 8 < 0 || this.selectedGrid.index + 8 > 63) {
        return 1;
      }
    }
    return 0;
  }

  reDraw(camContext) {
    // console.log(this.gridArray.length);
    let i;
    let ii;
    let iii = 63;
    const unit = 900 / 8;
    const width = (camContext.viewportWidth / 2 - 450);
    const height = (camContext.viewportHeight / 2 - 450);
    for (ii = 0; ii < 8; ii += 1) {
      for (i = 0; i < 8; i += 1) {
        if (iii > 0) {
          this.gridArray[iii].setXY(width + i * unit, height + unit * ii);
          iii -= 1;
        }
      }
    }
    this.gridArray[0].setXY(width + 7 * unit, height + unit * 7);
  }

  setUp() {
    let i;
    let ii;
    const unit = 900 / 8;
    const width = 0;
    const height = 0;
    for (ii = 0; ii < 8; ii += 1) {
      for (i = 0; i < 8; i += 1) {
        if (this.gridArray.length < 64) {
          if (ii % 2 !== 0 && i % 2 === 0 && ii !== 3 && ii !== 4) {
            this.gridArray.push(new GridBox(width + i * unit, height + unit * ii, 'black', new CheckerPiece(1, width + i * unit, height + ii * unit), true));
          } else if (ii % 2 === 0 && i % 2 !== 0 && ii !== 3 && ii !== 4) {
            this.gridArray.push((new GridBox(width + unit * i, height + unit * ii, 'black', new CheckerPiece(1, width + i * unit, height + ii * unit), true)));
          } else {
            this.gridArray.push((new GridBox(width + unit * i, height + unit * ii, 'black', undefined, false)));
          }
          if (this.gridArray.length === 64) {
            this.gridArray = this.gridArray.reverse();
          }
        }
      }
    }
    // console.log(this.gridArray);
    this.setPlayers();
    this.gridArray.forEach((grid, idx) => grid.setIndex(idx));
  }

  // HARDCODED
  nextTurn() {
    if (this.currentTurn === this.player1) {
      this.currentTurn = this.player2;
    } else {
      this.currentTurn = this.player1;
    }
  }

  setPlayers() {
    if (!this.set) {
      if (this.selectedGrid === undefined) {
        let i;
        for (i = 0; i < 32; i += 1) {
          if (this.gridArray[i] !== undefined) {
            if (this.gridArray[i].hasPiece) {
              this.gridArray[i].checkerPiece.player = PlayerManager.getInstance().getSelfId();
              this.me = PlayerManager.getInstance().getSelfId();
              this.gridArray[i].checkerPiece.color = 'red';
            }
          }
        }
        for (i = 32; i < 64; i += 1) {
          if (this.gridArray[i] !== undefined) {
            if (this.gridArray[i].hasPiece) {
              if (PlayerManager.getInstance().getSelfId() === this.player1) {
                this.gridArray[i].checkerPiece.player = this.player2;
                this.opponent = this.player2;
              } else {
                this.gridArray[i].checkerPiece.player = this.player1;
                this.opponent = this.player1;
              }
              this.gridArray[i].checkerPiece.color = 'blue';
            }
          }
        }
        this.set = true;
      }
    }
  }

  getGridIndex(x, y) {
    let g;
    this.gridArray.forEach((grid) => {
      if (x > grid.x && x < grid.x + 900 / 8 && y > grid.y && y < grid.y + 900 / 8) {
        g = grid;
      }
    });
    return g;
  }

  resetBoard() {
    this.gridArray.forEach((grid) => grid.setColor('black'));
  }

  isEnemy(index) {
    return this.gridArray[index].checkerPiece.player !== this.currentTurn;
  }

  checkWin() {
    let p1 = false;
    let p2 = false;
    this.gridArray.forEach((grid) => {
      if (grid.hasPiece) {
        if (grid.checkerPiece.player === this.player1) {
          p1 = true;
        } else if (grid.checkerPiece.player === this.player2) {
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

  /*
  noPossibleMoves() {
    let p1 = 0;
    let p2 = 0;

    this.gridArray.forEach((grid) => {
      if (grid.hasPiece) {
        if (grid.checkerPiece.player === this.player1) {
          if (grid.getDiagonals('bottom').left === undefined &&
          grid.getDiagonals('bottom').right === undefined) {
            p1 += 0;
          } else if (grid.getDiagonals('bottom').left === undefined) {
            p1 += this.gridArray[grid.getDiagonals('bottom').right].hasPiece ? 0 : 1;
          } else if (grid.getDiagonals('bottom').right === undefined) {
            p1 += this.gridArray[grid.getDiagonals('bottom').left].hasPiece ? 0 : 1;
          } else if (!this.gridArray[grid.getDiagonals('bottom').left].hasPiece |
          | !this.gridArray[grid.getDiagonals('bottom').right].hasPiece) {
            p1 += 1;
          }
        }
      }
    });

    this.gridArray.forEach((grid) => {
      if (grid.hasPiece) {
        if (grid.checkerPiece.player === this.player2) {
          if (grid.getDiagonals('top').left === undefined && grid.
          getDiagonals('top').right === undefined) {
            p2 += 0;
          } else if (grid.getDiagonals('top').left === undefined) {
            p2 += this.gridArray[grid.getDiagonals('top').right].hasPiece ? 0 : 1;
          } else if (grid.getDiagonals('top').right === undefined) {
            p2 += this.gridArray[grid.getDiagonals('top').left].hasPiece ? 0 : 1;
          } else if (!this.gridArray[grid.getDiagonals('top').left].hasPiece
          || !this.gridArray[grid.getDiagonals('top').right].hasPiece) {
            p2 += 1;
          }
        }
      }
    });
  }
  */

  highlightMoves() {
    if (this.selectedGrid.hasPiece) {
      if (this.selectedGrid.checkerPiece.color === 'red') {
        if (this.selectedGrid.checkerPiece.player === this.currentTurn) {
          if (this.currentTurn === this.me
            || (this.currentTurn === this.opponent && this.selectedGrid.checkerPiece.isKing)) {
            if (this.selectedGrid.getDiagonals('bottom').left !== undefined) {
              if (this.gridArray[this.selectedGrid.getDiagonals('bottom').left].hasPiece) {
                if (this.isEnemy(this.selectedGrid.getDiagonals('bottom').left)) {
                  if (this.gridArray[this.selectedGrid.getDiagonals('bottom').left].getDiagonals('bottom').left !== undefined) {
                    if (!this.gridArray[this.gridArray[this.selectedGrid.getDiagonals('bottom').left].getDiagonals('bottom').left].hasPiece) {
                      this.gridArray[this.gridArray[this.selectedGrid.getDiagonals('bottom').left].getDiagonals('bottom').left].color = 'green';
                    }
                  }
                }
              } else {
                this.gridArray[this.selectedGrid.getDiagonals('bottom').left].setColor('green');
              }
            }
            if (this.selectedGrid.getDiagonals('bottom').right !== undefined) {
              if (this.gridArray[this.selectedGrid.getDiagonals('bottom').right].hasPiece) {
                if (this.isEnemy(this.selectedGrid.getDiagonals('bottom').right)) {
                  if (this.gridArray[this.selectedGrid.getDiagonals('bottom').right].getDiagonals('bottom').right !== undefined) {
                    if (!this.gridArray[this.gridArray[this.selectedGrid.getDiagonals('bottom').right].getDiagonals('bottom').right].hasPiece) {
                      this.gridArray[this.gridArray[this.selectedGrid.getDiagonals('bottom').right].getDiagonals('bottom').right].color = 'green';
                    }
                  }
                }
              } else {
                this.gridArray[this.selectedGrid.getDiagonals('bottom').right].setColor('green');
              }
            }
          }
          if ((this.currentTurn === this.me && this.selectedGrid.checkerPiece.isKing)
          || this.currentTurn === this.opponent) {
            if (this.selectedGrid.getDiagonals('top').left !== undefined) {
              if (this.gridArray[this.selectedGrid.getDiagonals('top').left].hasPiece) {
                if (this.isEnemy(this.selectedGrid.getDiagonals('top').left)) {
                  if (this.gridArray[this.selectedGrid.getDiagonals('top').left].getDiagonals('top').left !== undefined) {
                    if (!this.gridArray[this.gridArray[this.selectedGrid.getDiagonals('top').left].getDiagonals('top').left].hasPiece) {
                      this.gridArray[this.gridArray[this.selectedGrid.getDiagonals('top').left].getDiagonals('top').left].color = 'green';
                    }
                  }
                }
              } else {
                this.gridArray[this.selectedGrid.getDiagonals('top').left].setColor('green');
              }
            }
            if (this.selectedGrid.getDiagonals('top').right !== undefined) {
              if (this.gridArray[this.selectedGrid.getDiagonals('top').right].hasPiece) {
                if (this.isEnemy(this.selectedGrid.getDiagonals('top').right)) {
                  if (this.gridArray[this.selectedGrid.getDiagonals('top').right].getDiagonals('top').right !== undefined) {
                    if (!this.gridArray[this.gridArray[this.selectedGrid.getDiagonals('top').right].getDiagonals('top').right].hasPiece) {
                      this.gridArray[this.gridArray[this.selectedGrid.getDiagonals('top').right].getDiagonals('top').right].color = 'green';
                    }
                  }
                }
              } else {
                this.gridArray[this.selectedGrid.getDiagonals('top').right].setColor('green');
              }
            }
          }
          /*
          // TODO: detect when no possible moves
          let gg = false;
          this.gridArray.forEach((grid) => {
            if (grid.color === 'green') {
              gg = true;
            }
          });
          if (!gg) {
            alert('lose');
          } */
        }
      }
    }
  }
}
