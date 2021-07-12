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
    furniture: data.furniture,
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

function buildGameUpdate(opCode, data) {
  return {
    opCode,
    gameName: data.gameName,
    lobbyId: data.lobbyId,
    state: data.state,
    from: data.from,
    player1: data.player1,
    player2: data.player2,
    action: data.action,
  };
}

function buildVoiceChannelData(opCode, data) {
  return {
    opCode,
    users: data,
  };
}

function buildLobbyReply(opCode, data) {
  return {
    opCode,
    msg: data,
  };
}

function buildStartGame(opCode, data) {
  return {
    opCode,
    mode: data.mode,
    player1: data.player1,
    player2: data.player2,
    tableId: data.tableId,
    gameName: data.gameName,
    gameState: data.gameState,
  };
}

function buildFurnitureSync(opCode, data) {
  return {
    opCode,
    furniture: data,
  };
}

function buildWhiteboardEcho(opCode, data) {
  return {
    opCode,
    boardId: data.id,
    state: data.state,
    delta: data.delta,
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
  'game-update-echo': buildGameUpdate,
  'voice-channel-data': buildVoiceChannelData,
  'lobby-reply': buildLobbyReply,
  'start-game': buildStartGame,
  'end-game': buildLobbyReply,
  'furniture-sync': buildFurnitureSync,
  'whiteboard-state-echo': buildWhiteboardEcho,
};

export default function buildGamePacket(opCode, data) {
  if (opCode in handlers) {
    return handlers[opCode](opCode, data);
  }
  console.log(`[ServerSender] Unknown Op Code: ${opCode}`);
  return undefined;
}
