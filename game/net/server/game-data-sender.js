export default function buildGamePacket(opCode, data) {
  if (opCode === 'handshake') {
    return {
      opCode
    };
  } else if (opCode === 'movement') {
    return {
      opCode,
      data
    };
  } else if (opCode === 'spawn-reply') {
    return {
      opCode,
      self: flattenPlayer(data[0]),
      others: data[1].map(x => flattenPlayer(x))
    };
  } else if (opCode === 'spawn-player') {
    return {
      opCode,
      player: flattenPlayer(data)
    };
  } else if (opCode === 'move-echo') {
    return {
      opCode,
      name: data.name,
      x: data.x,
      y: data.y,
      direction: data.direction
    };
  }
  else if (opCode === 'chat-echo'){
    return{
      opCode,
      name: data.name,
      message: data.message,
    };
  }
}

function flattenPlayer(playerObj) {
  return { name: playerObj.name };
}