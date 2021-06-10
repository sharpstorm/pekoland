import CheckerPiece from './CheckerPiece.js';
import Grid from './Grid.js';

export default class Board {
  constructor(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
    this.gridArray = [];
    this.selectedGrid = undefined;
    this.selectedPiece = undefined;
    this.currentTurn = 'Player 1';
  }

  drawBoard(ctx) {
    ctx.beginPath();
    this.gridArray.forEach((grid) => grid.drawAt(ctx));
  }

  move() {
    let f;
    let t;
    if (this.selectedGrid.color === 'green') {
      this.selectedPiece.movePieceTo(this.selectedGrid);
      const indexDiff = this.selectedGrid.index - this.selectedPiece.index;
      if (this.currentTurn === 'Player 1' || (this.currentTurn === 'Player 2' && this.selectedGrid.checkerPiece.isKing)) {
        if (indexDiff === 14) {
          this.gridArray[this.selectedPiece.index + 7].removePiece();
        } else if (indexDiff === 18) {
          this.gridArray[this.selectedPiece.index + 9].removePiece();
        }
        if (this.isAtEnd() === 1 && !this.selectedGrid.checkerPiece.isKing) {
          this.selectedGrid.checkerPiece.isKing = true;
        }
      }
      if ((this.currentTurn === 'Player 1' && this.selectedGrid.checkerPiece.isKing) || this.currentTurn === 'Player 2') {
        if (indexDiff === -14) {
          this.gridArray[this.selectedPiece.index - 7].removePiece();
        } else if (indexDiff === -18) {
          this.gridArray[this.selectedPiece.index - 9].removePiece();
        }
        if (this.isAtEnd() === 2 && !this.selectedGrid.checkerPiece.isKing) {
          this.selectedGrid.checkerPiece.isKing = true;
        }
      }
      f = this.selectedPiece.index;
      t = this.selectedGrid.index;
      // console.log(`from: ${f}`);
      // console.log(`to: ${t}`);
      this.resetBoard();
      this.nextTurn();
      return { from: f, to: t };
    }
    return undefined;
  }

  isAtEnd() {
    if (this.currentTurn === 'Player 2') {
      if (this.selectedGrid.index - 8 < 0) {
        return 2;
      }
    } else if (this.currentTurn === 'Player 1') {
      if (this.selectedGrid.index + 8 > 63) {
        return 1;
      }
    }
    return 0;
  }

  setUp(uiState) {
    let i;
    let ii;
    const unit = 900 / 8;
    const width = (uiState.viewportWidth / 2 - 450);
    const height = (uiState.viewportHeight / 2 - 450);
    for (ii = 0; ii < 8; ii += 1) {
      for (i = 0; i < 8; i += 1) {
        if (this.gridArray.length < 64) {
          if (ii % 2 !== 0 && i % 2 === 0 && ii !== 3 && ii !== 4) {
            this.gridArray.push(new Grid(width + i * unit, height + unit * ii, 'black', new CheckerPiece(1, width + i * unit, height + ii * unit), true));
          } else if (ii % 2 === 0 && i % 2 !== 0 && ii !== 3 && ii !== 4) {
            this.gridArray.push((new Grid(width + unit * i, height + unit * ii, 'black', new CheckerPiece(1, width + i * unit, height + ii * unit), true)));
          } else {
            this.gridArray.push((new Grid(width + unit * i, height + unit * ii, 'black', undefined, false)));
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
    if (this.currentTurn === 'Player 1') {
      this.currentTurn = 'Player 2';
    } else {
      this.currentTurn = 'Player 1';
    }
  }

  setPlayers() {
    if (this.selectedGrid === undefined) {
      let i;
      for (i = 0; i < 32; i += 1) {
        if (this.gridArray[i] !== undefined) {
          if (this.gridArray[i].hasPiece) {
            this.gridArray[i].checkerPiece.player = 'Player 1';
          }
        }
      }
      for (i = 32; i < 64; i += 1) {
        if (this.gridArray[i] !== undefined) {
          if (this.gridArray[i].hasPiece) {
            this.gridArray[i].checkerPiece.player = 'Player 2';
          }
        }
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
        if (grid.checkerPiece.player === 'Player 1') {
          p1 = true;
        } else if (grid.checkerPiece.player === 'Player 2') {
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
        if (grid.checkerPiece.player === 'Player 1') {
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
        if (grid.checkerPiece.player === 'Player 2') {
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
      if (this.selectedGrid.checkerPiece.player === this.currentTurn) {
        if (this.currentTurn === 'Player 1' || (this.currentTurn === 'Player 2' && this.selectedGrid.checkerPiece.isKing)) {
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
        if ((this.currentTurn === 'Player 1' && this.selectedGrid.checkerPiece.isKing) || this.currentTurn === 'Player 2') {
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

        // TODO: detect when no possible moves
        let gg = false;
        this.gridArray.forEach((grid) => {
          if (grid.color === 'green') {
            gg = true;
          }
        });
        if (!gg) {
          alert('lose');
        }
      }
    }
  }
}
