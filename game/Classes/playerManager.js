class playerManager{
    playerArr = [];


    addPlayer(player){
        this.playerArr.push(player);
    }

    getArr(){
        return this.playerArr;
    }

    getPlayer(name)
    {
        for(i = 0; i < this.getArr().length; i++){
            if(this.getArr()[i].name == name)
                pp = this.getArr()[i];
        }
        return pp;
    }

}