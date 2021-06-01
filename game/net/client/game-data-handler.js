import PlayerManager from '../../managers/player-manager.js';
import SpriteManager from '../../managers/sprite-manager.js';
import Player from '../../models/player.js';
import NetworkManager from '../network-manager.js';
import buildClientGamePacket from './game-data-sender.js';

// Conn will always be the server
export default function handleGamePacket(data, conn) {
  console.log(data);
  if (!data.opCode) return;

  const opCode = data.opCode;
  if (opCode === 'handshake') {
    conn.send(buildClientGamePacket('spawn-request', {
      name: NetworkManager.getInstance().configStore.name,
      userId: NetworkManager.getInstance().configStore.userId
    }));
  
  } else if (opCode === 'spawn-reply') {
    let self = inflatePlayer(data.self);
    PlayerManager.getInstance().addPlayer(self);
    PlayerManager.getInstance().setSelf(self.userId);
    data.others.forEach(x => {
      PlayerManager.getInstance().addPlayer(inflatePlayer(x));
    });
  
  } else if (opCode === 'spawn-reject') {
    alert(data.msg);
    window.close();
  
  } else if (opCode === 'spawn-player') {
    PlayerManager.getInstance().addPlayer(inflatePlayer(data.player));
  
  } else if (opCode === 'despawn-player') {
    console.log('de spawn ' + data.userId);
    PlayerManager.getInstance().removePlayer(data.userId);
  
  } else if (opCode === 'move-echo') {
    let player = PlayerManager.getInstance().getPlayer(data.userId);
    player.moveTo(data.x, data.y);
    player.direction = data.direction;

  } else if (opCode === 'chat-echo') {
    let player = PlayerManager.getInstance().getPlayer(data.userId);
    player.chat.updateMessage(data.message);
  }
}

function inflatePlayer(data) {
  let player = new Player(data.userId, data.name, SpriteManager.getInstance().getSprite('rabbit-avatar'));
  player.x = data.x;
  player.y = data.y;
  return player;
}