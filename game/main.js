import PlayerSprite from './managers/sprite-manager.js';
import Player from './models/player.js';
import PlayerManager from './managers/player-manager.js';
import { joystickWorker, joystickUpWorker } from './workers/joystick.js';
import drawer from './managers/animation-manager.js';

let currentPlayer2 = '';
//TODO. Hardcoded sprite var
let down = [0,38,33];
let up = [0,116,33];
let right = [0,158,40];
let left = [0,77,40];

//init rabbit sprite
let rabbit = new Image();
rabbit.src = 'Images/rabbit.png';
let rabbitSprite = new PlayerSprite(up,down,right,left,rabbit);

//init bg
var map = new Image();
map.src = "Images/house.jpg";

//Init player manager and add player TODO::hardcoded
const playerManager = PlayerManager.getInstance();
playerManager.addPlayer(new Player("Johnny",rabbitSprite));
//playerManager.addPlayer(new Player("Player 2",rabbitSprite));
//playerManager.addPlayer(new Player("Player 3",rabbitSprite));


for(let i = 0; i < playerManager.getArr().length; i++){
    let pp = playerManager.getArr()[i];
    pp.sourceX = pp.playerSprite.down[0];
    pp.sourceY = pp.playerSprite.down[1];
}


document.onkeydown = joystickWorker;


player2List();
window.requestAnimationFrame(() => drawer(playerManager));

// Append <button> to <body>
function player2List() {
    for(let i = 0; i < playerManager.getArr().length; i++){
        let pp = playerManager.getArr()[i];
        pp.sourceX = pp.playerSprite.down[0];
        pp.sourceY = pp.playerSprite.down[1];
        var btn = document.createElement("BUTTON");   // Create a <button> element
        btn.innerHTML = pp.name;                // Insert text
        btn.id = pp.name;
        btn.onclick = function(){
            
            document.getElementById("currPlayer2").innerHTML = this.id;   
            for(i = 0; i < playerManager.getArr().length; i++){
                if(playerManager.getArr()[i].name == this.id)
                    currentPlayer2 = playerManager.getArr()[i];
            }
            //console.log(currentPlayer2);
        };
      
        document.body.appendChild(btn);
    }
      
}

function playerBtn(aa){
    alert(aa);
}