import { expect, jest, test } from '@jest/globals';
import MapManager from '../managers/map-manager';
import PlayerManager from '../managers/player-manager';
import WorldManager from '../managers/world-manager';

test('[Manager] Test Map Manager', () => {
  const mapManager = new MapManager();

  expect(mapManager.getMap('m1')).toBeUndefined();
  expect(mapManager.getMap('m2')).toBeUndefined();
  expect(mapManager.getCurrentMap()).toBeUndefined();

  // Add Test
  const map1 = {};
  const map2 = {};
  mapManager.registerMap('m1', map1);
  expect(Object.keys(mapManager.maps).length).toBe(1);
  expect(mapManager.getMap('m1')).toBe(map1);
  expect(mapManager.getMap('m2')).toBeUndefined();
  expect(mapManager.getCurrentMap()).toBe(map1);

  mapManager.registerMap('m2', map2);
  expect(Object.keys(mapManager.maps).length).toBe(2);
  expect(mapManager.getMap('m1')).toBe(map1);
  expect(mapManager.getMap('m2')).toBe(map2);
  expect(mapManager.getCurrentMap()).toBe(map1);

  // Change current map
  mapManager.setMap('m10'); // Invalid
  expect(mapManager.getCurrentMap()).toBe(map1);

  mapManager.setMap('m2');
  expect(mapManager.getCurrentMap()).toBe(map2);

  // Removal
  mapManager.removeMap('m1');
  expect(Object.keys(mapManager.maps).length).toBe(1);
  expect(mapManager.getCurrentMap()).toBe(map2);

  mapManager.registerMap('m1', map1);
  expect(Object.keys(mapManager.maps).length).toBe(2);

  mapManager.removeMap('m2');
  expect(Object.keys(mapManager.maps).length).toBe(1);
  expect(mapManager.getCurrentMap()).toBe(map1);

  mapManager.removeMap('m1');
  expect(Object.keys(mapManager.maps).length).toBe(0);
  expect(mapManager.getCurrentMap()).toBeUndefined();

  // Singleton Check
  const inst1 = MapManager.getInstance();
  const inst2 = MapManager.getInstance();
  expect(inst1).toBe(inst2);
});

test('[Manager] Test Player Manager', () => {
  const playerManager = new PlayerManager();

  const handler = jest.fn();
  playerManager.on(PlayerManager.Events.SPAWN_SELF, handler);
  expect(Object.keys(playerManager.eventHandlers).length).toBe(1);

  expect(playerManager.getPlayers().length).toBe(0);
  expect(playerManager.getSelf()).toBeUndefined();
  expect(playerManager.getSelfId()).toBeUndefined();

  // Add Test
  const player1 = { userId: 'aaaa' };
  const player2 = { userId: 'bbbb' };

  playerManager.addPlayer(player1);
  expect(playerManager.getPlayers().length).toBe(1);
  playerManager.addPlayer(player2);
  expect(playerManager.getPlayers().length).toBe(2);

  // Get Player
  expect(playerManager.getPlayer('aaaa')).toBe(player1);
  expect(playerManager.getPlayer('bbbb')).toBe(player2);

  // Set Self
  expect(playerManager.getSelf()).toBeUndefined();
  expect(playerManager.getSelfId()).toBeUndefined();

  playerManager.setSelf('aaa'); // Invalid Self
  expect(playerManager.getSelfId()).toBeUndefined();

  playerManager.setSelf('aaaa');
  expect(playerManager.getSelfId()).toBe('aaaa');
  expect(playerManager.getSelf()).toBe(player1);
  expect(handler).toHaveBeenCalled();

  // Remove Player
  playerManager.removePlayer('bbbb');
  expect(playerManager.getPlayers().length).toBe(1);
  expect(playerManager.getPlayer('bbbb')).toBeUndefined();
  expect(playerManager.getSelf()).toBe(player1);

  // Reset
  playerManager.addPlayer(player2);
  expect(playerManager.getPlayers().length).toBe(2);

  // Remove Self
  playerManager.removePlayer('aaaa');
  expect(playerManager.getPlayers().length).toBe(1);
  expect(playerManager.getPlayer('aaaa')).toBeUndefined();
  expect(playerManager.getSelf()).toBeUndefined();

  // Singleton Check
  const inst1 = PlayerManager.getInstance();
  const inst2 = PlayerManager.getInstance();
  expect(inst1).toBe(inst2);
});

test('[Manager] Test World Manager Room Control', () => {
  const worldManager = new WorldManager();
  expect(worldManager.getRoomController()).toBeDefined();

  const joinReqEvt = jest.fn();
  const admitEvt = jest.fn();
  const rejectEvt = jest.fn();
  const joinEvt = jest.fn();
  const leaveEvt = jest.fn();
  worldManager.getRoomController().on('playerRequestJoin', joinReqEvt);
  worldManager.getRoomController().on('playerAdmit', admitEvt);
  worldManager.getRoomController().on('playerReject', rejectEvt);
  worldManager.getRoomController().on('playerJoin', joinEvt);
  worldManager.getRoomController().on('playerLeave', leaveEvt);

  worldManager.registerPlayer('p1', 'u1');
  expect(joinEvt).toHaveBeenCalled();
  worldManager.registerPlayer('p2', 'u2');
  expect(joinEvt).toHaveBeenCalledTimes(2);

  // Mapping Check
  expect(worldManager.getPlayerId('p1')).toBe('u1');
  expect(worldManager.getPlayerId('p2')).toBe('u2');
  expect(worldManager.getPeerId('u1')).toBe('p1');
  expect(worldManager.getPeerId('u2')).toBe('p2');
  expect(worldManager.getPlayerId('p3')).toBeUndefined();
  expect(worldManager.getPeerId('u3')).toBeUndefined();

  // Waiting Room Check
  const room = worldManager.getRoomController();
  room.addWaitingRoom('p3', 'name3');
  expect(joinReqEvt).not.toHaveBeenCalled();
  room.addWaitingRoom('p1', 'name1');
  expect(joinReqEvt).toHaveBeenCalled();

  room.admitIntoWorld('p2');
  expect(admitEvt).not.toHaveBeenCalled();
  room.admitIntoWorld('p1');
  expect(admitEvt).toHaveBeenCalled();

  room.addWaitingRoom('p1', 'name1');
  room.rejectAdmit('p2');
  expect(rejectEvt).not.toHaveBeenCalled();
  room.rejectAdmit('p1');
  expect(rejectEvt).toHaveBeenCalled();

  // Removal Check
  worldManager.removePlayer('p2');
  expect(worldManager.getPlayerId('p2')).toBeUndefined();
  expect(worldManager.getPeerId('u2')).toBeUndefined();
  expect(worldManager.getPlayerId('p1')).toBe('u1');
  expect(worldManager.getPeerId('u1')).toBe('p1');
});

test('[Manager] Test World Manager Lobby Control', () => {
  const worldManager = new WorldManager();

  // Creation
  expect(worldManager.lobbyExist('lobby1')).toBe(false);
  worldManager.createLobby('lobby1', 'host1', 'game1');

  // Lobby properties
  expect(worldManager.lobbyExist('lobby1')).toBe(true);
  expect(worldManager.getGameName('lobby1')).toBe('game1');

  // Lobby Users
  expect(worldManager.getHost('lobby1')).toBe('host1');
  expect(worldManager.getLobbyFromPlayer('host1')).toBeDefined();
  expect(worldManager.getOpponent('host1')).toBeUndefined();
  expect(worldManager.getJoiner('lobby1')).toBeUndefined();

  // Join
  worldManager.joinLobby('lobby1', 'join1');
  expect(worldManager.getJoiner('lobby1')).toBe('join1');
  expect(worldManager.getOpponent('host1')).toBe('join1');
  expect(worldManager.getOpponent('join1')).toBe('host1');
  expect(worldManager.getLobbyFromPlayer('join1')).toBeDefined();

  // Error Checking
  expect(worldManager.getHost('lobby2')).toBeUndefined();
  expect(worldManager.getJoiner('lobby2')).toBeUndefined();
  expect(worldManager.getGameName('lobby2')).toBeUndefined();
  expect(worldManager.getLobbyFromPlayer('join2')).toBeUndefined();
  expect(worldManager.getOpponent('join2')).toBeUndefined();

  // Spectate
  expect(worldManager.getSpectators('lobby1').length).toBe(0);
  expect(worldManager.getSpectators('lobby2')).toBeUndefined();
  worldManager.addSpectator('lobby1', 'spectate1');
  expect(worldManager.getSpectators('lobby1').length).toBe(1);
  worldManager.addSpectator('lobby1', 'spectate2');
  expect(worldManager.getSpectators('lobby1').length).toBe(2);
  expect(worldManager.getSpectators('lobby1').indexOf('spectate1')).toBeGreaterThanOrEqual(0);
  expect(worldManager.getSpectators('lobby1').indexOf('spectate2')).toBeGreaterThanOrEqual(0);
  expect(worldManager.getSpectators('lobby1').indexOf('spectate3')).toBe(-1);

  worldManager.removeSpectator('lobby1', 'spectate2');
  expect(worldManager.getSpectators('lobby1').indexOf('spectate2')).toBe(-1);

  // Lobby State
  expect(worldManager.getLobbyGameState('lobby1')).toBeUndefined();
  worldManager.updateLobbyGameState('lobby1', 'state1');
  expect(worldManager.getLobbyGameState('lobby1')).toBe('state1');
  worldManager.updateLobbyGameState('lobby1', 'state2');
  expect(worldManager.getLobbyGameState('lobby1')).toBe('state2');

  // For All in Lobby
  const handler = jest.fn();
  worldManager.lobbyForAll('lobby1', handler);
  expect(handler).toHaveBeenCalledTimes(3);

  // Lobby Remove
  worldManager.closeLobby('lobby2');
  expect(worldManager.lobbyExist('lobby1')).toBe(true);
  worldManager.closeLobby('lobby1');
  expect(worldManager.lobbyExist('lobby1')).toBe(false);
});

test('[Manager] Test World Manager Singleton', () => {
  const inst1 = WorldManager.getInstance();
  const inst2 = WorldManager.getInstance();
  expect(inst1).toBe(inst2);
});
