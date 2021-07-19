import { expect, jest, test } from '@jest/globals';
import GameManager from '../managers/game-manager';
import PlayerManager from '../managers/player-manager';
import WorldManager from '../managers/world-manager';
import NetworkManager from '../net/network-manager';

jest.mock('../net/network-manager');
const endCall = jest.fn();
const startCall = jest.fn();

test('[GameManager] Test Game Manager Voice', async () => {
  NetworkManager.getInstance.mockImplementation(() => ({
    getOperationMode: () => NetworkManager.Mode.CLIENT,
    send: () => {},
    connectVoice: startCall,
    disconnectVoice: () => {},
    getSelfPeerId: () => 'aaaa',
    getCallManager: () => ({
      getConnectedPeers: () => ['bbbb', 'cccc'],
      endCall,
    }),
  }));

  const gameManager = new GameManager();

  expect(gameManager.getVoiceChannelManager()).toBeDefined();

  const voiceManager = gameManager.getVoiceChannelManager();
  await expect(voiceManager.activateMicrophone()).rejects.toThrow();

  expect(gameManager.getVoiceChannelManager().connected).toBe(false);
  gameManager.getVoiceChannelManager().joinVoice();
  expect(gameManager.getVoiceChannelManager().connected).toBe(true);
  await expect(voiceManager.activateMicrophone()).rejects.toThrow(); // No Mic

  expect(gameManager.getVoiceChannelManager().disconnectVoice());
  expect(gameManager.getVoiceChannelManager().connected).toBe(false);

  const play = jest.fn();
  const pause = jest.fn();

  global.Audio = class {
    // eslint-disable-next-line class-methods-use-this
    play() {
      play();
    }

    // eslint-disable-next-line class-methods-use-this
    pause() {
      pause();
    }

    // eslint-disable-next-line class-methods-use-this
    load() {

    }
  };

  voiceManager.addOutputStream('peer1', 'stream1');
  expect(voiceManager.outputObjects.peer1).toBeDefined();
  expect(play).toHaveBeenCalled();

  voiceManager.removeOutputStream('peer1', 'stream1');
  expect(voiceManager.outputObjects.peer1).toBeUndefined();
  expect(pause).toHaveBeenCalled();

  voiceManager.addOutputStream('peer1', 'stream1');
  voiceManager.addOutputStream('peer2', 'stream2');
  expect(Object.keys(voiceManager.outputObjects).length).toBe(2);
  voiceManager.clearOutputStreams();
  expect(Object.keys(voiceManager.outputObjects).length).toBe(0);

  // Test Delta Updates
  voiceManager.updateChannelUsers(['bbbb']); // Ignore Update
  expect(startCall).not.toHaveBeenCalled();
  expect(endCall).not.toHaveBeenCalled();

  voiceManager.updateChannelUsers(['aaaa', 'bbbb']);
  expect(startCall).toHaveBeenCalled();
  expect(endCall).toHaveBeenCalled();

  endCall.mockClear();
  startCall.mockClear();
  voiceManager.updateChannelUsers(['aaaa', 'bbbb', 'cccc', 'd']);
  expect(endCall).not.toHaveBeenCalled();
  expect(startCall).toHaveBeenCalledTimes(3);

  global.Audio = undefined;
});

test('[GameManager] Test Game Manager Text', async () => {
  const gameManager = new GameManager();

  expect(gameManager.getTextChannelManager()).toBeDefined();
  const textManager = gameManager.getTextChannelManager();

  const handler = jest.fn();
  textManager.addChangeListener(handler);

  expect(handler).not.toHaveBeenCalled();
  textManager.addToHistory('name1', 'msg1');
  expect(handler).toHaveBeenCalled();

  expect(textManager.getHistory().length).toBe(1);
  expect(textManager.getHistory()[0]).toBe('name1: msg1');
});

test('[GameManager] Test Game Manager Board Game (Server)', async () => {
  const sendTo = jest.fn();
  NetworkManager.getInstance.mockImplementation(() => ({
    getOperationMode: () => NetworkManager.Mode.SERVER,
    send: () => {},
    getSelfPeerId: () => 'aaaa',
    getConnection: () => ({ sendTo }),
  }));

  const gameManager = new GameManager();

  expect(gameManager.getBoardGameManager()).toBeDefined();
  const boardGameManager = gameManager.getBoardGameManager();

  const uiMenu = {
    displayWindow: jest.fn(),
    close: jest.fn(),
  };
  const uiOverlay = {
    show: jest.fn(),
    close: jest.fn(),
  };
  const game1 = {
    gameName: 'game1',
    startGame: jest.fn(),
    spectateGame: jest.fn(),
    endGame: jest.fn(),
  };

  // Test UI Registering
  expect(boardGameManager.gameMenuUI).toBeUndefined();
  expect(boardGameManager.gameOverlayUI).toBeUndefined();
  boardGameManager.registerGameMenuUI(uiMenu);
  boardGameManager.registerGameOverlayUI(uiOverlay);
  expect(boardGameManager.gameMenuUI).toBe(uiMenu);
  expect(boardGameManager.gameOverlayUI).toBe(uiOverlay);

  // Test Game Registration
  expect(boardGameManager.gameList.length).toBe(0);
  expect(boardGameManager.getGame('game1')).toBeUndefined();
  boardGameManager.register(game1);
  expect(boardGameManager.gameList.length).toBe(1);
  expect(boardGameManager.getGame('game1')).toBe(game1);

  // State Setter
  expect(boardGameManager.gameState).toBeUndefined();
  boardGameManager.setGameState('waitingCheck');
  expect(boardGameManager.gameState).toBe('waitingCheck');
  boardGameManager.setGameState(undefined);

  // Trigger Events
  PlayerManager.getInstance().addPlayer({
    userId: 'aaa',
    name: 'aaa',
    x: 100,
    y: 100,
  });
  PlayerManager.getInstance().setSelf('aaa');
  boardGameManager.handleEvent(500, 500); // Fail Proximity
  expect(uiMenu.displayWindow).not.toHaveBeenCalled();

  // Trigger Table Click (new room)
  boardGameManager.handleEvent(100, 100);
  expect(uiMenu.displayWindow).toHaveBeenLastCalledWith(0);

  // Trigger Table Click Again (partially occupied room)
  boardGameManager.setGameState(undefined);
  WorldManager.getInstance().createLobby('100-100', 'bbb', 'xxx');
  boardGameManager.handleEvent(100, 100);
  expect(uiMenu.displayWindow).toHaveBeenLastCalledWith(1);

  // Trigger Table Again (Spectator)
  boardGameManager.setGameState(undefined);
  WorldManager.getInstance().joinLobby('100-100', 'ccc');
  boardGameManager.handleEvent(100, 100);
  expect(uiMenu.displayWindow).toHaveBeenLastCalledWith(2);

  // Trigger Close Game Menu
  expect(WorldManager.getInstance().getLobby('100-100')).toBeDefined();
  boardGameManager.setGameState('hosting');
  boardGameManager.tableId = '100-100';
  boardGameManager.closeGameMenu();
  expect(WorldManager.getInstance().getLobby('100-100')).toBeUndefined();

  // Test Join Game
  WorldManager.getInstance().createLobby('100-100', 'bbb', 'game1');
  boardGameManager.tableId = '100-100';
  expect(game1.startGame).not.toHaveBeenCalled();
  boardGameManager.joinGame();
  expect(game1.startGame).toHaveBeenCalled();
  expect(uiMenu.close).toHaveBeenCalled();

  // Test Spectate Game
  uiMenu.close.mockClear();
  expect(game1.spectateGame).not.toHaveBeenCalled();
  boardGameManager.joinGameSpectate();
  expect(game1.spectateGame).toHaveBeenCalled();
  expect(uiMenu.close).toHaveBeenCalled();
  expect(WorldManager.getInstance().getLobby('100-100').spectators.length).toBe(1);

  // Test Leave
  boardGameManager.setGameState('spectating');
  boardGameManager.currentGame = 'game1';
  boardGameManager.tableId = '100-100';
  boardGameManager.leaveGame();
  expect(game1.endGame).toHaveBeenCalled();
  expect(WorldManager.getInstance().getLobby('100-100')).toBeDefined();

  game1.endGame.mockClear();
  sendTo.mockClear();
  boardGameManager.setGameState('playing');
  boardGameManager.currentGame = 'game1';
  boardGameManager.tableId = '100-100';
  boardGameManager.joinGame();
  boardGameManager.leaveGame();
  expect(WorldManager.getInstance().getLobby('100-100')).toBeUndefined();
  expect(game1.endGame).toHaveBeenCalled();
  expect(sendTo).toHaveBeenCalled();
});

test('[GameManager] Test Game Manager Board Game (Client)', async () => {
  const send = jest.fn();
  NetworkManager.getInstance.mockImplementation(() => ({
    getOperationMode: () => NetworkManager.Mode.CLIENT,
    send,
    getSelfPeerId: () => 'aaaa',
  }));

  const gameManager = new GameManager();

  expect(gameManager.getBoardGameManager()).toBeDefined();
  const boardGameManager = gameManager.getBoardGameManager();

  const uiMenu = {
    displayWindow: jest.fn(),
    close: jest.fn(),
  };
  const uiOverlay = {
    show: jest.fn(),
    close: jest.fn(),
  };
  const game1 = {
    gameName: 'game1',
    startGame: jest.fn(),
    spectateGame: jest.fn(),
    endGame: jest.fn(),
  };
  boardGameManager.registerGameMenuUI(uiMenu);
  boardGameManager.registerGameOverlayUI(uiOverlay);
  boardGameManager.register(game1);
  PlayerManager.getInstance().addPlayer({
    userId: 'aaa',
    name: 'aaa',
    x: 100,
    y: 100,
  });
  PlayerManager.getInstance().setSelf('aaa');

  // Test Click
  boardGameManager.handleEvent(100, 100);
  expect(send).toHaveBeenCalled();
  expect(send.mock.calls[0][0].opCode).toBe('check-lobby-state-request');

  // Test Close
  send.mockClear();
  boardGameManager.setGameState('hosting');
  boardGameManager.closeGameMenu();
  expect(send).toHaveBeenCalled();
  expect(send.mock.calls[0][0].opCode).toBe('leave-lobby');
  expect(send.mock.calls[0][0].mode).toBe('hosting');

  // Test Join
  send.mockClear();
  boardGameManager.tableId = '100-100';
  boardGameManager.setGameState('selecting');
  boardGameManager.joinGame();
  expect(send).toHaveBeenCalled();
  expect(send.mock.calls[0][0].opCode).toBe('join-lobby');
  expect(send.mock.calls[0][0].mode).toBe('player');

  // Test Spectate
  send.mockClear();
  boardGameManager.tableId = '100-100';
  boardGameManager.setGameState('selecting');
  boardGameManager.joinGameSpectate();
  expect(send).toHaveBeenCalled();
  expect(send.mock.calls[0][0].opCode).toBe('join-lobby');
  expect(send.mock.calls[0][0].mode).toBe('spectator');

  // Test Leave Game
  send.mockClear();
  boardGameManager.tableId = '100-100';
  boardGameManager.currentGame = 'game1';
  boardGameManager.setGameState('playing');
  boardGameManager.leaveGame();
  expect(send).toHaveBeenCalled();
  expect(send.mock.calls[0][0].opCode).toBe('leave-lobby');
  expect(send.mock.calls[0][0].mode).toBe('playing');
});

test('[GameManager] Test Game Manager Whiteboard (Server)', async () => {
  const sendTo = jest.fn();
  NetworkManager.getInstance.mockImplementation(() => ({
    getOperationMode: () => NetworkManager.Mode.SERVER,
    getSelfPeerId: () => 'aaaa',
    getConnection: () => ({ sendTo }),
  }));

  PlayerManager.getInstance = jest.fn();
  PlayerManager.getInstance.mockImplementation(() => ({
    getSelfId: () => 'aaa',
  }));

  let closeListener;
  let updateListener;

  const deltaCanvasUpdate = jest.fn();
  const setCanvasState = jest.fn();
  const boardUI = {
    show: jest.fn(),
    setCloseListener: (x) => { closeListener = x; },
    setUpdateListener: (x) => { updateListener = x; },
    deltaCanvasUpdate,
    setCanvasState,
  };

  const gameManager = new GameManager();

  expect(gameManager.getBoardGameManager()).toBeDefined();
  const whiteboardManager = gameManager.getWhiteboardManager();

  whiteboardManager.registerUI(boardUI);
  expect(whiteboardManager.boardUI).toBe(boardUI);

  // Open new Board
  expect('100-100' in WorldManager.getInstance().whiteboards).toBeFalsy();
  whiteboardManager.openBoard(100, 100);
  expect('100-100' in WorldManager.getInstance().whiteboards).toBeTruthy();
  expect(WorldManager.getInstance().whiteboards['100-100'].users.length).toBe(1);

  expect(whiteboardManager.currentBoard).toBe('100-100');
  expect(boardUI.show).toHaveBeenCalled();
  expect(closeListener).toBeDefined();
  expect(updateListener).toBeDefined();

  // Test Outgoing Updates
  sendTo.mockClear();
  WorldManager.getInstance().addWhiteboardPlayer('100-100', 'bbb');
  updateListener('state', 'delta');
  expect(sendTo).toHaveBeenCalled();
  expect(sendTo.mock.calls[0][0].opCode).toBe('whiteboard-state-echo');
  expect(sendTo.mock.calls[0][0].delta).toBe('delta');
  expect(sendTo.mock.calls[0][0].state).toBeUndefined();

  sendTo.mockClear();
  updateListener('state');
  expect(sendTo).toHaveBeenCalled();
  expect(sendTo.mock.calls[0][0].opCode).toBe('whiteboard-state-echo');
  expect(sendTo.mock.calls[0][0].state).toBe('state');
  expect(sendTo.mock.calls[0][0].delta).toBeUndefined();

  // Test Incoming Updates
  expect(deltaCanvasUpdate).not.toHaveBeenCalled();
  whiteboardManager.updateBoardState('100-100', 'state', 'delta');
  expect(deltaCanvasUpdate).toHaveBeenCalled();

  expect(setCanvasState).not.toHaveBeenCalled();
  whiteboardManager.updateBoardState('100-100', 'state');
  expect(setCanvasState).toHaveBeenCalled();
});

test('[GameManager] Test Game Manager Whiteboard (Client)', async () => {
  const send = jest.fn();
  NetworkManager.getInstance.mockImplementation(() => ({
    getOperationMode: () => NetworkManager.Mode.CLIENT,
    getSelfPeerId: () => 'aaaa',
    send,
  }));

  PlayerManager.getInstance = jest.fn();
  PlayerManager.getInstance.mockImplementation(() => ({
    getSelfId: () => 'aaa',
  }));

  const deltaCanvasUpdate = jest.fn();
  const setCanvasState = jest.fn();
  let closeListener;
  let updateListener;
  const boardUI = {
    show: jest.fn(),
    setCloseListener: (x) => { closeListener = x; },
    setUpdateListener: (x) => { updateListener = x; },
    deltaCanvasUpdate,
    setCanvasState,
  };

  const gameManager = new GameManager();

  expect(gameManager.getBoardGameManager()).toBeDefined();
  const whiteboardManager = gameManager.getWhiteboardManager();

  whiteboardManager.registerUI(boardUI);
  expect(send).not.toHaveBeenCalled();
  whiteboardManager.openBoard(100, 100);
  expect(send).toHaveBeenCalled();
  expect(send.mock.calls[0][0].opCode).toBe('join-whiteboard');
  expect(boardUI.show).toHaveBeenCalled();
  expect(closeListener).toBeDefined();
  expect(updateListener).toBeDefined();

  send.mockClear();
  closeListener();
  expect(send).toHaveBeenCalled();
  expect(send.mock.calls[0][0].opCode).toBe('leave-whiteboard');

  send.mockClear();
  updateListener('state', 'delta');
  expect(send).toHaveBeenCalled();
  expect(send.mock.calls[0][0].opCode).toBe('update-whiteboard');
  expect(send.mock.calls[0][0].delta).toBe('delta');
  expect(send.mock.calls[0][0].state).toBe('state');
});
