import { expect, jest, test } from '@jest/globals';
import GameManager from '../managers/game-manager';
import NetworkManager from '../net/network-manager';

jest.mock('../net/network-manager');
const endCall = jest.fn();
const startCall = jest.fn();
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

test('[GameManager] Test Game Manager Voice', async () => {
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
