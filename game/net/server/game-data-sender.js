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
      self: flattenPlayer(data.self),
      others: data.others.map(x => flattenPlayer(x))
    };
  } else if (opCode === 'spawn-reject') {
    return {
      opCode,
      msg: data
    }
  } else if (opCode === 'spawn-player') {
    return {
      opCode,
      player: flattenPlayer(data)
    };
  } else if (opCode === 'despawn-player') {
    return {
      opCode,
      userId: data
    }
  } else if (opCode === 'move-echo') {
    return {
      opCode,
      userId: data.userId,
      x: data.x,
      y: data.y,
      direction: data.direction
    };
  }
  else if (opCode === 'chat-echo'){
    return{
      opCode,
      userId: data.userId,
      message: data.message,
    };
  }
}

function flattenPlayer(playerObj) {
  return { 
    userId: playerObj.userId,
    name: playerObj.name,
    x: playerObj.x,
    y: playerObj.y
  };
}