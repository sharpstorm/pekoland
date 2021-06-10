/* eslint-disable quote-props */
/* eslint-disable no-unused-vars */

import PlayerManager from '../../managers/player-manager.js';
import ChatManager from '../../managers/chat-manager.js';
import SpriteManager from '../../managers/sprite-manager.js';
import Player from '../../models/player.js';
import NetworkManager from '../network-manager.js';
import buildClientGamePacket from './game-data-sender.js';
import Renderer from '../../managers/animation-manager.js';

function inflatePlayer(data) {
  const player = new Player(data.userId, data.name, SpriteManager.getInstance().getSprite('rabbit-avatar'));
  player.x = data.x;
  player.y = data.y;
  return player;
}

function handleHandshake(data, conn) {
  conn.send(buildClientGamePacket('spawn-request', {
    name: NetworkManager.getInstance().configStore.name,
    userId: NetworkManager.getInstance().configStore.userId,
  }));
}

function handleSpawnReply(data, conn) {
  const self = inflatePlayer(data.self);
  PlayerManager.getInstance().addPlayer(self);
  PlayerManager.getInstance().setSelf(self.userId);
  Renderer.getCameraContext().centerOn(self.x, self.y);
  data.others.forEach((x) => {
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
  const player = PlayerManager.getInstance().getPlayer(data.userId);
  player.moveTo(data.x, data.y);
  player.direction = data.direction;
}

function handleChatEcho(data, conn) {
  const player = PlayerManager.getInstance().getPlayer(data.userId);
  ChatManager.getInstance().bigChatBox.push(`${player.name}: ${data.message}`);
  player.chat.updateMessage(data.message);
}

function handleVoiceChannelData(data, conn) {
  const voiceUsers = data.users;
  if (!voiceUsers.includes(NetworkManager.getInstance().getSelfPeerId())) {
    return;
  }

  const remoteUsers = voiceUsers.filter((x) => x !== NetworkManager.getInstance().getSelfPeerId());

  // Cleanup disconnected users
  NetworkManager.getInstance().getCallManager().getConnectedPeers()
    .filter((x) => !remoteUsers.includes(x))
    .forEach((x) => NetworkManager.getInstance().getCallManager().endCall(x));

  // Connect to remaining or new users
  if (voiceUsers.length === 1) {
    console.log('Only 1 person in voice channel');
    return;
  }
  remoteUsers.forEach((x) => { NetworkManager.getInstance().connectVoice(x); });
}

const handlers = {
  'handshake': handleHandshake,
  'spawn-reply': handleSpawnReply,
  'spawn-reject': handleSpawnReject,
  'spawn-player': handleSpawnPlayer,
  'despawn-player': handleDespawnPlayer,
  'move-echo': handleMoveEcho,
  'chat-echo': handleChatEcho,
  'voice-channel-data': handleVoiceChannelData,
};

// Conn will always be the server
export default function handleGamePacket(data, conn) {
  console.log(data);
  if (!data.opCode) return;

  const { opCode } = data;
  if (opCode in handlers) {
    handlers[opCode](data, conn);
    return;
  }
  console.log(`[ClientHandler] Unknown Op Code: ${opCode}`);
}
