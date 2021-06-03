import PlayerManager from '../../managers/player-manager.js';
import ChatManager from '../../managers/chat-manager.js';
import SpriteManager from '../../managers/sprite-manager.js';
import WorldManager from '../../managers/world-manager.js';
import Player from '../../models/player.js';
import buildGamePacket from './game-data-sender.js';
import NetworkManager from '../network-manager.js';

const spawnLocation = [0, 0];

const handlers = {
  'handshake': handleHandshake,
  'spawn-request': handleSpawnRequest,
  'move': handleMove,
  'chat': handleChat
};

// Conn can be used to uniquely identify the peer
export default function handleGamePacket(data, conn) {
  if (!data.opCode) return;

  const opCode = data.opCode;
  if (opCode in handlers) {
    return handlers[opCode](data, conn);
  }
  console.log('[ServerHandler] Unknown Op Code: ' + opCode);
}

function handleHandshake(data, conn) {
  conn.send(buildGamePacket('handshake'));
}

function handleSpawnRequest(data, conn) {
  let name = data.name;
  let userId = data.userId;
  if (PlayerManager.getInstance().getPlayer(userId) !== undefined) {
    //Reject Connection
    conn.send(buildGamePacket('spawn-reject', 'Your account is already connected in the session!'));
    return;
  }

  let player = new Player(userId, name, SpriteManager.getInstance().getSprite('rabbit-avatar'));
  // Update connection
  conn.send(buildGamePacket('spawn-reply', {
    self: player,
    others: PlayerManager.getInstance().getPlayers()
  }));

  // Broadcast to everyone else
  NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('spawn-player', player), conn.peer);

  // Register User to Server Player Manager and Server World Manager
  PlayerManager.getInstance().addPlayer(player);
  WorldManager.getInstance().registerPlayer(conn.peer, userId);
}

function handleMove(data, conn) {
  let player = PlayerManager.getInstance().getPlayer(data.userId);
  player.moveTo(data.x, data.y);
  player.direction = data.direction;
  NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('move-echo', data), conn.peer);
}

function handleChat(data, conn) {
  let player = PlayerManager.getInstance().getPlayer(data.userId);
  ChatManager.getInstance().bigChatBox.push(player.name + ": " + data.message);
  player.chat.updateMessage(data.message);
  NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('chat-echo', data), conn.peer);
}