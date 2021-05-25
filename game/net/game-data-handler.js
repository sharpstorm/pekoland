export default function handleGamePacket(data) {
  if (!data.opCode) return;

  const opCode = data.opCode;
  if (opCode === 'movement') {
    console.log('update position: ' + data.data);
  }
}