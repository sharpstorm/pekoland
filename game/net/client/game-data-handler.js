import PlayerManager from '../../managers/player-manager.js';
import SpriteManager from '../../managers/sprite-manager.js';
import Player from '../../models/player.js';
import NetworkManager from '../network-manager.js';
import buildClientGamePacket from './game-data-sender.js';

const handlers = {
  'handshake': handleHandshake,
  'spawn-reply': handleSpawnReply,
  'spawn-reject': handleSpawnReject,
  'spawn-player': handleSpawnPlayer,
  'despawn-player': handleDespawnPlayer,
  'move-echo': handleMoveEcho,
  'chat-echo': handleChatEcho
};

// Conn will always be the server
export default function handleGamePacket(data, conn) {
  console.log(data);
  if (!data.opCode) return;

  const opCode = data.opCode;
  if (opCode in handlers) {
    return handlers[opCode](data, conn);
  }
  console.log('[ClientHandler] Unknown Op Code: ' + opCode);
}

function handleHandshake(data, conn) {
  conn.send(buildClientGamePacket('spawn-request', {
    name: NetworkManager.getInstance().configStore.name,
    userId: NetworkManager.getInstance().configStore.userId
  }));
}

function handleSpawnReply(data, conn) {
  let self = inflatePlayer(data.self);
  PlayerManager.getInstance().addPlayer(self);
  PlayerManager.getInstance().setSelf(self.userId);
  data.others.forEach(x => {
    PlayerManager.getInstance().addPlayer(inflatePlayer(x));
  });
}

function handleSpawnReject(data, conn) {
  alert(data.msg);
  window.close();
}

function handleSpawnPlayer(data, conn) {
  PlayerManager.getInstance().addPlayer(inflatePlayer(data.player));
}

function handleDespawnPlayer(data, conn) {
  PlayerManager.getInstance().removePlayer(data.userId);
}

function handleMoveEcho(data, conn) {
  let player = PlayerManager.getInstance().getPlayer(data.userId);
  player.moveTo(data.x, data.y);
  player.direction = data.direction;
}

function handleChatEcho(data, conn) {
  let player = PlayerManager.getInstance().getPlayer(data.userId);
  player.chat.updateMessage(data.message);
}

function inflatePlayer(data) {
  let player = new Player(data.userId, data.name, SpriteManager.getInstance().getSprite('rabbit-avatar'));
  player.x = data.x;
  player.y = data.y;
  return player;
}