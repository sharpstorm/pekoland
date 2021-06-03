//CONTEXT OBJECT
//GET FRAME IN TERM OF COORD [X-X] [Y-Y]
//CHECK IF OBJECT IS IN FRAME
import MapManager from '../managers/map-manager.js';

let instance

export default class CameraContext{
    constructor(){
        this.x = 0;
        this.y = 0;
        this.oldX = 0;
        this.oldY = 0;
        this.newX = 0;
        this.newY = 0;
    }

    animate(delta) {
        if (this.newX - this.x === 0 && this.newY - this.y === 0) return;
    
        let stdDeltaX = (this.newX - this.oldX) / 24;
        let stdDeltaY = (this.newY - this.oldY) / 24;
    
        if (Math.abs(this.newX - this.x) > Math.abs(stdDeltaX)) {
          this.x += stdDeltaX * (delta / 16.66667);
          return;
        } else if (Math.abs(this.newY - this.y) > Math.abs(stdDeltaY)) {
          this.y += stdDeltaY * (delta / 16.66667);
          return;
        }
    
        this.x = this.newX;
        this.y = this.newY;
        this.oldX = this.x;
        this.oldY = this.y;
      }

    moveContext(){
        this.oldX = this.x;
        this.oldY = this.y;
        this.newX = newX;
        this.newY = newY;
    }

    moveContextToGrid(newX, newY){
        this.oldX = this.x; 
        this.oldY = this.y;
        this.newX = newX * MapManager.getInstance().getCurrentMap().getGridLength();
        this.newY = newY * MapManager.getInstance().getCurrentMap().getGridLength();
    }

    
    getGridCoord(){
        return {x : this.x / MapManager.getInstance().getCurrentMap().getGridLength(), y: this.y / MapManager.getInstance().getCurrentMap().getGridLength()};
    }

    static getInstance() {
        if (instance === undefined) {
          instance = new CameraContext();
        }
        return instance;
    }

}
