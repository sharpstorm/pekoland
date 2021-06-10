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

function buildCheckersUpdate(opCode, data) {
  return {
    opCode,
    player1: data.player1,
    player2: data.player2,
    move: data.action,
  };
}

const handlers = {
  'handshake': buildEmptyPacket,
  'spawn-request': buildSpawnRequest,
  'move': buildMoveUpdate,
  'chat': buildChatUpdate,
  'checkers': buildCheckersUpdate,
};

export default function buildGameDataPacket(opCode, data) {
  if (opCode in handlers) {
    return handlers[opCode](opCode, data);
  }
  console.log(`[ClientSender] Unknown Op Code: ${opCode}`);
  return undefined;
}
