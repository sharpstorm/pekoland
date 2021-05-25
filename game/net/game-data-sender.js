export default function buildGameDataPacket(opCode, data) {
  if (opCode === 'movement') {
    return {
      opCode,
      data
    }
  }
}