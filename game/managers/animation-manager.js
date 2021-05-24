import PlayerManager from './player-manager.js';

let counter = 0;
function drawer() {
  if (counter > 4) {
    var ctx = document.getElementById('game').getContext('2d');
    ctx.clearRect(0, 0, 1000, 500);

    //ctx.fillRect(0, 0, 1000, 500);
    //BG
    //ctx.drawImage(map, -80, 900, 2000,1000,0,0,1000,500);
    drawGrids(1000, 500, 50);

    //draw rect
    /*ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.lineWidth = "6";
    ctx.rect(425, 200, 150, 100);
    ctx.stroke();*/

    //TO change to whole playerlist. hard coded for first player for now
    /*
    pp = playerManager.getArr()[0];
    ctx.drawImage(pp.playerSprite.image,pp.sourceX,pp.sourceY,37.5,40,pp.x,pp.y,50,50);*/

    //console.log(playerManager.getArr());

    PlayerManager.getInstance().getPlayers().forEach(player => {
      // Nametag
      ctx.font = '10px Arial';
      ctx.strokeText(player.name, player.x, player.y);
      ctx.drawImage(player.playerSprite.image, player.sourceX, player.sourceY, 37.5, 40, player.x, player.y, 50, 50);

      player.animate();
    });

    counter = 0;  //FPS
  }
  counter++;
  window.requestAnimationFrame(drawer);
}

function drawGrids(height, width, gridLength) {
  var ctx = document.getElementById('game').getContext('2d');
  for (let i = 0; i < height; i += gridLength) {
    for (let ii = 0; ii < width; ii += gridLength) {
      ctx.beginPath();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = '1';
      ctx.rect(i, ii, gridLength, gridLength);
      ctx.stroke();
    }
  }
}

function draggable() {
  console.log(getPixel())
}

function getPixel(x, y) {
  var ctx = document.getElementById('game').getContext('2d');
  return context.getImageData(x, y, 1, 1).data;
}

export default drawer;