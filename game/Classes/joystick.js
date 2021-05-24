function joyStick(e){
    var event = window.event ? window.event : e;
    if(event.keyCode == "38" && playerManager.getArr()[0].currentSprite > 5){
        playerManager.getPlayer("Johnny").moveY= -50/6;
        if(ctx.getImageData(playerManager.getPlayer("Johnny").x+25, playerManager.getPlayer("Johnny").y+25-50,1, 1).data[3] == 255){
            
            playerManager.getPlayer("Johnny").moveY= 0;
        }
        playerManager.getPlayer("Johnny").currentSprite = 0;
        playerManager.getPlayer("Johnny").sourceX = playerManager.getArr()[0].playerSprite.up[0];
        playerManager.getPlayer("Johnny").sourceY = playerManager.getArr()[0].playerSprite.up[1];
        playerManager.getPlayer("Johnny").action = "up";
        
    }
    else if(event.keyCode == "40" && playerManager.getArr()[0].currentSprite > 5){  
        playerManager.getPlayer("Johnny").moveY= 50/6;
        if(ctx.getImageData(playerManager.getPlayer("Johnny").x+25, playerManager.getPlayer("Johnny").y+25+50,1, 1).data[3] == 255){
            
            playerManager.getPlayer("Johnny").moveY= 0;
        }
        playerManager.getPlayer("Johnny").currentSprite = 0;
        playerManager.getPlayer("Johnny").sourceX = playerManager.getPlayer("Johnny").playerSprite.down[0];
        playerManager.getPlayer("Johnny").sourceY = playerManager.getPlayer("Johnny").playerSprite.down[1];
        playerManager.getPlayer("Johnny").action = "down";
        
    }
      
    else if(event.keyCode == "37" && playerManager.getPlayer("Johnny").currentSprite > 5){
        playerManager.getPlayer("Johnny").moveX= -50/6;
        if(ctx.getImageData(playerManager.getPlayer("Johnny").x+25-50, playerManager.getPlayer("Johnny").y+25,1, 1).data[3] == 255){
            
            playerManager.getPlayer("Johnny").moveX= 0;
        }
        playerManager.getPlayer("Johnny").currentSprite = 0;
        playerManager.getPlayer("Johnny").sourceX = playerManager.getPlayer("Johnny").playerSprite.left[0];
        playerManager.getPlayer("Johnny").sourceY = playerManager.getPlayer("Johnny").playerSprite.left[1];
        playerManager.getPlayer("Johnny").action = "left";
    }
     
    else if(event.keyCode == "39" && playerManager.getPlayer("Johnny").currentSprite > 5){
        playerManager.getPlayer("Johnny").moveX= 50/6;
        if(ctx.getImageData(playerManager.getPlayer("Johnny").x+25+50, playerManager.getPlayer("Johnny").y+25,1, 1).data[3] == 255){
            
            playerManager.getPlayer("Johnny").moveX= 0;
        }

        playerManager.getPlayer("Johnny").currentSprite = 0;
        playerManager.getPlayer("Johnny").sourceX = playerManager.getPlayer("Johnny").playerSprite.right[0];
        playerManager.getPlayer("Johnny").sourceY = playerManager.getPlayer("Johnny").playerSprite.right[1];
        playerManager.getPlayer("Johnny").action = "right";
        
    }


    //player2 
    //console.log("WTF");
    //console.log(currentPlayer2)
    if(event.keyCode == "87" && currentPlayer2.currentSprite > 5){
        currentPlayer2.moveY= -50/6;
        currentPlayer2.currentSprite = 0;
        currentPlayer2.sourceX = currentPlayer2.playerSprite.up[0];
        currentPlayer2.sourceY = currentPlayer2.playerSprite.up[1];
        currentPlayer2.action = "up";
        
    }
    else if(event.keyCode == "83" && currentPlayer2.currentSprite > 5){
        
        currentPlayer2.moveY= 50/6;
        currentPlayer2.currentSprite = 0;
        currentPlayer2.sourceX = playerManager.getArr()[0].playerSprite.down[0];
        currentPlayer2.sourceY = playerManager.getArr()[0].playerSprite.down[1];
        currentPlayer2.action = "down";
        
    }
      
    else if(event.keyCode == "65" && currentPlayer2.currentSprite > 5){
        currentPlayer2.moveX= -50/6;
        currentPlayer2.currentSprite = 0;
        currentPlayer2.sourceX = playerManager.getArr()[0].playerSprite.left[0];
        currentPlayer2.sourceY = playerManager.getArr()[0].playerSprite.left[1];
        currentPlayer2.action = "left";
    }
     
    else if(event.keyCode == "68" && currentPlayer2.currentSprite > 5){
        currentPlayer2.moveX= 50/6;
        currentPlayer2.currentSprite = 0;
        currentPlayer2.sourceX = playerManager.getArr()[0].playerSprite.right[0];
        currentPlayer2.sourceY = playerManager.getArr()[0].playerSprite.right[1];
        currentPlayer2.action = "right";
        
    }
    

  
}

function joyStickUp(e){
    var event = window.event ? window.event : e;
    //if(event.keyCode == "40" || event.keyCode == "39" || event.keyCode == "38" || event.keyCode == "37" )

}
