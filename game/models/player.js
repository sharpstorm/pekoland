export default class Player{
    name;
    x = 0;
    y = 0;
    moveX = 0;
    moveY = 0;
    sourceX = 0;
    sourceY = 0;
    playerSprite;
    action = "";
    currentSprite = 7;


    constructor(name, playerSprite){
        this.name = name;
        this.playerSprite = playerSprite;
   
    }

    updateX(newX){
        this.x = newX;
    }

    updateY(newY){
        this.Y = newY;
    }

    animate(){
         
        var ctx = document.getElementById('game').getContext('2d');
        //console.log("X:" + this.x + "Y:" + this.y);
        //console.log(ctx.getImageData(this.x+25, this.y+25, 1, 1).data);
        if(this.action == "down" && this.currentSprite < 6){
            this.sourceX += this.playerSprite.down[2];
            this.currentSprite++;
            this.y += this.moveY;
            
            //console.log(this.y);
        }
        else if(this.action == "up" && this.currentSprite < 6){
            this.sourceX += this.playerSprite.up[2];
            this.currentSprite++;
            this.y += this.moveY;
        }
        else if(this.action == "left" && this.currentSprite < 6){
            this.sourceX += this.playerSprite.left[2];
            this.currentSprite++;
            this.x += this.moveX;
        }
        else if(this.action == "right" && this.currentSprite < 6){
            this.sourceX += this.playerSprite.right[2];
            this.currentSprite++;
            this.x += this.moveX;
        }

        //Collision
       
        //console.log(ctx.getImageData(this.x, this.y, 1, 1).data[3]);
        if(ctx.getImageData(this.x, this.y, 50, 50).data[3] == 255){
            //console.log("collide: " + this.name);
            //console.log(this.x + "," + this.y);
            //console.log(ctx.getImageData(this.x + 25, this.y + 25, 1, 1).data);
        }
        //console.log(ctx.getImageData(this.x, this.y, 1, 1).data);
        //console.log(this.currentSprite);
    }
}