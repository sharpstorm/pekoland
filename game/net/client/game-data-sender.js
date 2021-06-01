import PlayerManager from '../../managers/player-manager.js'

export default function buildGameDataPacket(opCode, data) {
  if (opCode === 'handshake') {
    return { opCode, data };
  
  } else if (opCode === 'spawn-request') {
    return {
      opCode,
      name: data.name,
      userId: data.userId
    }
  
  } else if (opCode === 'move') {
    return {
      opCode,
      direction: data.id,
      userId: PlayerManager.getInstance().getSelfId(),
      x: data.x,
      y: data.y
    };
  
  } else if (opCode === 'chat'){
    return{
      opCode,
      userId: PlayerManager.getInstance().getSelfId(),
      message: data.msg
    };
  
  } else {
    console.log('unknown op code: ' + opCode);
  }
}
