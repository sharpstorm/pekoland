import PlayerManager from '../../managers/player-manager.js';
import ChatManager from '../../managers/chat-manager.js';
import SpriteManager from '../../managers/sprite-manager.js';
import WorldManager from '../../managers/world-manager.js';
import Player from '../../models/player.js';
import buildGamePacket from './game-data-sender.js';
import NetworkManager from '../network-manager.js';

const spawnLocation = [0, 0];

// Conn can be used to uniquely identify the peer
export default function handleGamePacket(data, conn) {
  if (!data.opCode) return;

  const opCode = data.opCode;
  if (opCode === 'handshake') {
    conn.send(buildGamePacket('handshake'));
  } else if (opCode === 'spawn-request') {
    let name = data.data;
    if (PlayerManager.getInstance().getPlayer(name) !== undefined) {
      //Reject Connection
      conn.send(buildGamePacket('spawn-reject', 'Player with same name already in game'));
      return;
    }

    let player = new Player(name, SpriteManager.getInstance().getSprite('rabbit-avatar'));
    // Update connection
    conn.send(buildGamePacket('spawn-reply', [player, PlayerManager.getInstance().getPlayers()]));

    // Broadcast to everyone else
    NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('spawn-player', player), conn.peer);

    // Register User to Server Player Manager and Server World Manager
    PlayerManager.getInstance().addPlayer(player);
    WorldManager.getInstance().registerPlayer(conn.peer, name);

  } else if (opCode === 'move') {
    let player = PlayerManager.getInstance().getPlayer(data.name);
    player.moveTo(data.x, data.y);
    player.direction = data.direction;

    NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('move-echo', data), conn.peer);
  }
  else if(opCode == 'chat'){
    let player = PlayerManager.getInstance().getPlayer(data.name);
    ChatManager.getInstance().bigChatBox.push(data.name + ": " + data.message);
    player.chat.updateMessage(data.message);
    NetworkManager.getInstance().getConnection().sendAllExcept(buildGamePacket('chat-echo', data), conn.peer);
  }
}
