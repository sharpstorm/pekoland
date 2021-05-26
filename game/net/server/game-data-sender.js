export default function buildGamePacket(opCode, data) {
  if (opCode === 'handshake') {
    return {
      opCode
    }
  } else if (opCode === 'movement') {
    return {
      opCode,
      data
    }
  } else if (opCode === 'spawn-reply') {
    return {
      opCode,
      self: flattenPlayer(data[0]),
      others: data[1].map(x => flattenPlayer(x))
    }
  } else if (opCode === 'spawn-player') {
    return {
      opCode,
      player: flattenPlayer(data)
    }
  }
}

function flattenPlayer(playerObj) {
  return { name: playerObj.name };
}