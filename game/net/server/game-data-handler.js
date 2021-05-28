import PlayerManager from '../../managers/player-manager.js';
import SpriteManager from '../../managers/sprite-manager.js';
import Player from '../../models/player.js';
import handleClientGamePacket from '../client/game-data-handler.js';
import buildGamePacket from './game-data-sender.js';
import NetworkManager from '../network-manager.js';
import buildGameDataPacket from '../client/game-data-sender.js';

const spawnLocation = [0, 0];

// Conn can be used to uniquely identify the peer
export default function handleGamePacket(data, conn) {
  if (!data.opCode) return;

  const opCode = data.opCode;
  if (opCode === 'handshake') {
    conn.send(buildGamePacket('handshake'));
  } else if (opCode === 'spawn-request') {
    let name = data.data;
    let player = new Player(name, SpriteManager.getInstance().getSprite('rabbit-avatar'));
    
    // Update connection
    conn.send(buildGamePacket('spawn-reply', [player, PlayerManager.getInstance().getPlayers()]));

    // Broadcast to everyone else
    NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('spawn-player', player), conn.peer);

    // Register User to Server Player Manager
    PlayerManager.getInstance().addPlayer(player);
  } else if (opCode === 'move') {
    let player = PlayerManager.getInstance().getPlayer(data.name);
    //player.x += data.dX;
    //player.y += data.dY;
    player.updateX(player.x + data.dX);
    player.updateY(player.y + data.dY);
    //console.log(data.dX);
    player.currentFrame = 0;
    player.direction = data.direction;

    NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('move-echo', data), conn.peer);
  }
  else if(opCode == 'chat'){
    let player = PlayerManager.getInstance().getPlayer(data.name);
    player.chat.updateMessage(data.message);
    NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('chat-echo', data), conn.peer);
  }
}
