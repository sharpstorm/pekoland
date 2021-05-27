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
    conn.send(buildClientGamePacket('spawn-request', NetworkManager.getInstance().configStore.name));
  } else if (opCode === 'spawn-reply') {
    let self = inflatePlayer(data.self);
    PlayerManager.getInstance().addPlayer(self);
    PlayerManager.getInstance().setSelf(self.name);
    data.others.forEach(x => {
      PlayerManager.getInstance().addPlayer(inflatePlayer(x));
    })
  } else if (opCode === 'spawn-player') {
    PlayerManager.getInstance().addPlayer(inflatePlayer(data.player));
  } else if (opCode === 'move-echo') {
    let player = PlayerManager.getInstance().getPlayer(data.name);
    //player.x += data.dX;
    //player.y += data.dY;
    player.updateX(player.x + data.dX);
    player.updateY(player.y + data.dY);
    console.log(data.dX);
    player.currentFrame = 0;
    player.direction = data.direction;

  }
}

function inflatePlayer(data) {
  return new Player(data.name, SpriteManager.getInstance().getSprite('rabbit-avatar'));
}