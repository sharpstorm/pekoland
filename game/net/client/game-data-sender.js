export default function buildGameDataPacket(opCode, data) {
  if (opCode === 'handshake' || opCode === 'spawn-request' || opCode === 'movement') {
    return {
      opCode,
      data
    }
  }
}
