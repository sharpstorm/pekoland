const canvas = document.createElement('canvas');
canvas.id = 'collision';
canvas.width = 1000;
canvas.height = 500;

export default class Map {
    constructor(MapImage, CollisionMap) {
      this.MapImage = MapImage;
      this.CollisionMap = CollisionMap;
      this.mapWidth = 2326;
      this.widthGrids = 30;
      this.heightGrids = 20;
      canvas.getContext('2d').drawImage(this.MapImage, 0,0, this.getGridLength() * 30, this.getGridLength() * 20, 0,0,1000,500);   //Maybe change the 1000/500
    }
    

    getGridLength(){
      return this.mapWidth / this.widthGrids;
    }

    checkCollision(playerX, playerY){
      let lala = canvas.getContext('2d').getImageData((playerX-1) * (1000 / 30) + 1000/60 - 5, (playerY-1) * (500/20)  + 500/40-5, 1, 1).data;
      if (lala[3] === 255 && lala[0] === 0 && lala[1] === 0 && lala[2] === 0) {
        console.log(playerX, playerY);
        return true;
      }
      return false;
      //FOR TESTING----------------------------------------------------------------------------------------
      //TO PASS IN CANVAS
      //ctx.fillStyle = 'red';
      //ctx.fillRect((playerX-1) * (1000 / 30) + 1000/60 - 5, (playerY-1) * (500/20)  + 500/40-5, 10, 10);
      //FOR TESTING----------------------------------------------------------------------------------------
    }
}
  