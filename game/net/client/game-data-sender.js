import PlayerManager from '../../managers/player-manager.js'

export default function buildGameDataPacket(opCode, data) {
  if (opCode === 'handshake' || opCode === 'spawn-request') {
    return {
      opCode,
      data
    };
  } else if (opCode === 'move') {
    return {
      opCode,
      direction: data.id,
      name: PlayerManager.getInstance().getSelfName(),
      dX: data.deltaX,
      dY: data.deltaY,
    };
  } else {
    console.log('unknown op code: ' + opCode);
  }
}
