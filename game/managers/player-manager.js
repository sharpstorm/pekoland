let instance;

export default class PlayerManager{
    playerArr = [];


    addPlayer(player){
        this.playerArr.push(player);
    }

    getArr(){
        return this.playerArr;
    }

    getPlayer(name)
    {
        for(let i = 0; i < this.getArr().length; i++){
            if(this.getArr()[i].name == name)
                return this.getArr()[i];
        }
        return undefined;
    }

    static getInstance() {
        if (instance === undefined) {
            instance = new PlayerManager();
        }
        return instance;
    }
}