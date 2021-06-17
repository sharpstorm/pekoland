/* eslint-disable quote-props */

import PlayerManager from '../../managers/player-manager.js';

function buildEmptyPacket(opCode) {
  return { opCode };
}

function buildSpawnRequest(opCode, data) {
  return {
    opCode,
    name: data.name,
    userId: data.userId,
  };
}

function buildMoveUpdate(opCode, data) {
  return {
    opCode,
    direction: data.id,
    userId: PlayerManager.getInstance().getSelfId(),
    x: data.x,
    y: data.y,
  };
}

function buildChatUpdate(opCode, data) {
  return {
    opCode,
    userId: PlayerManager.getInstance().getSelfId(),
    message: data.msg,
  };
}

function buildGameUpdate(opCode, data) {
  return {
    opCode,
    gameName: data.gameName,
    from: data.from,
    player1: data.player1,
    player2: data.player2,
    action: data.action,
  };
}

function buildGameLobbyUpdate(opCode, data) {
  return {
    opCode,
    action: data.action,
    tableID: data.tableID,
    gameName: data.gameName,
    host: data.host,
    joiner: data.joiner,
  };
}

const handlers = {
  'handshake': buildEmptyPacket,
  'spawn-request': buildSpawnRequest,
  'move': buildMoveUpdate,
  'chat': buildChatUpdate,
  'game-update': buildGameUpdate,
  'join-voice': buildEmptyPacket,
  'disconnect-voice': buildEmptyPacket,
  'game-lobby': buildGameLobbyUpdate,
};

export default function buildGameDataPacket(opCode, data) {
  if (opCode in handlers) {
    return handlers[opCode](opCode, data);
  }
  console.log(`[ClientSender] Unknown Op Code: ${opCode}`);
  return undefined;
}
