/* eslint-disable quote-props */

function flattenPlayer(playerObj) {
  return {
    userId: playerObj.userId,
    name: playerObj.name,
    x: playerObj.x,
    y: playerObj.y,
    direction: playerObj.direction,
  };
}

function buildEmptyPacket(opCode) {
  return { opCode };
}

function buildSpawnReply(opCode, data) {
  return {
    opCode,
    self: flattenPlayer(data.self),
    others: data.others.map((x) => flattenPlayer(x)),
  };
}

function buildSpawnReject(opCode, data) {
  return {
    opCode,
    msg: data,
  };
}

function buildSpawnPlayer(opCode, data) {
  return {
    opCode,
    player: flattenPlayer(data),
  };
}

function buildDespawnPlayer(opCode, data) {
  return {
    opCode,
    userId: data,
  };
}

function buildMoveEcho(opCode, data) {
  return {
    opCode,
    userId: data.userId,
    x: data.x,
    y: data.y,
    direction: data.direction,
  };
}

function buildChatEcho(opCode, data) {
  return {
    opCode,
    userId: data.userId,
    message: data.message,
  };
}

function buildVoiceChannelData(opCode, data) {
  return {
    opCode,
    users: data,
  };
}

const handlers = {
  'handshake': buildEmptyPacket,
  'spawn-reply': buildSpawnReply,
  'spawn-reject': buildSpawnReject,
  'spawn-player': buildSpawnPlayer,
  'despawn-player': buildDespawnPlayer,
  'move-echo': buildMoveEcho,
  'chat-echo': buildChatEcho,
  'voice-channel-data': buildVoiceChannelData,
};

export default function buildGamePacket(opCode, data) {
  if (opCode in handlers) {
    return handlers[opCode](opCode, data);
  }
  console.log(`[ServerSender] Unknown Op Code: ${opCode}`);
  return undefined;
}
