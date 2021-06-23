import { expect, jest, test } from '@jest/globals';
import CallManager from '../net/call-manager';

// eslint-disable-next-line no-undef
beforeAll(() => {
  global.MediaStream = class {
    constructor() {
      this.tracks = [];
    }

    addTrack(track) {
      this.tracks.push(track);
    }
  };

  global.AudioContext = class {
    // eslint-disable-next-line class-methods-use-this
    createMediaStreamSource() {
      return {
        connect: () => {},
        disconnect: () => {},
      };
    }

    // eslint-disable-next-line class-methods-use-this
    createChannelMerger() {
      return {
        connect: () => {},
      };
    }

    // eslint-disable-next-line class-methods-use-this
    createMediaStreamDestination() {
      return {
        stream: {
          getAudioTracks: () => ['track0'],
        },
      };
    }
  };
});

// eslint-disable-next-line no-undef
afterAll(() => {
  global.MediaStream = undefined;
  global.AudioContext = undefined;
});

test('[CallManager] Test Call Manager Receive', async () => {
  const handlers = {};
  const mockClient = {
    on: (evt, handler) => {
      handlers[evt] = handler;
    },
  };

  const callRecv = jest.fn();
  const callEnd = jest.fn();
  const callStreamOpen = jest.fn();

  const eventListener = (evt) => {
    if (evt === CallManager.Events.CALL_RECEIVED) {
      callRecv();
    } else if (evt === CallManager.Events.CALL_ENDED) {
      callEnd();
    } else if (evt === CallManager.Events.CALL_STREAM_OPEN) {
      callStreamOpen();
    }
  };

  const callManager = new CallManager(eventListener);
  expect(callManager.state).toBe(CallManager.State.CREATED);
  expect(Object.values(callManager.calls).length).toBe(0);
  expect(Object.values(callManager.streams).length).toBe(0);
  expect(callManager.sendStream.tracks.length).toBe(1);

  // Run Setup Process
  callManager.setup(mockClient);
  expect(callManager.state).toBe(CallManager.State.READY);
  expect(handlers.call).toBeDefined();

  // Incoming Call
  const callHandlers = {};
  const callClose = jest.fn();
  handlers.call({
    answer: (stream) => {
      expect(stream).toBe(callManager.sendStream);
    },
    on: (evt, handler) => {
      callHandlers[evt] = handler;
    },
    peer: 'abcdef',
    close: callClose,
  });
  expect(callRecv).toHaveBeenCalled();
  expect(Object.values(callManager.calls).length).toBe(1);

  expect(callHandlers.close).toBeDefined();
  expect(callHandlers.stream).toBeDefined();

  // Open Stream
  const streamObj = {};
  callHandlers.stream(streamObj);
  expect(callStreamOpen).toHaveBeenCalled();
  expect(Object.values(callManager.streams).length).toBe(1);

  // End Invalid Call
  callManager.endCall('bbbb');
  expect(Object.values(callManager.calls).length).toBe(1);

  // End Valid Call
  callManager.endCall('abcdef');
  expect(callClose).toHaveBeenCalled();

  callClose.mockClear();
  callManager.endAllCalls();
  expect(callClose).toHaveBeenCalled();

  // Test Disposal
  expect(Object.values(callManager.calls).length).toBe(1);
  expect(Object.values(callManager.streams).length).toBe(1);
  callManager.dispose('abcdef');
  expect(Object.values(callManager.calls).length).toBe(0);
  expect(Object.values(callManager.streams).length).toBe(0);
});

test('[CallManager] Test Call Manager Call', async () => {
  const handlers = {};

  const callHandlers = {};
  const callClose = jest.fn();
  const mockCall = (peerId) => {
    expect(peerId).toBe('abcdef');
    return {
      on: (evt, handler) => {
        callHandlers[evt] = handler;
      },
      peer: 'abcdef',
      close: callClose,
    };
  };

  const mockClient = {
    on: (evt, handler) => {
      handlers[evt] = handler;
    },
    call: mockCall,
  };

  const callEvent = jest.fn();
  const callEnd = jest.fn();
  const callStreamOpen = jest.fn();

  const eventListener = (evt) => {
    if (evt === CallManager.Events.CALL) {
      callEvent();
    } else if (evt === CallManager.Events.CALL_ENDED) {
      callEnd();
    } else if (evt === CallManager.Events.CALL_STREAM_OPEN) {
      callStreamOpen();
    }
  };

  const callManager = new CallManager(eventListener);
  expect(callManager.state).toBe(CallManager.State.CREATED);
  expect(Object.values(callManager.calls).length).toBe(0);
  expect(Object.values(callManager.streams).length).toBe(0);
  expect(callManager.sendStream.tracks.length).toBe(1);

  // Run Setup Process
  callManager.setup(mockClient);
  expect(callManager.state).toBe(CallManager.State.READY);

  // Open call
  callManager.callPeer('abcdef');
  expect(callHandlers.close).toBeDefined();
  expect(callHandlers.stream).toBeDefined();
  expect(callEvent).toHaveBeenCalled();
  expect(Object.values(callManager.calls).length).toBe(1);

  const mockStream = {};
  callHandlers.stream(mockStream);
  expect(callStreamOpen).toHaveBeenCalled();
  expect(Object.values(callManager.streams).length).toBe(1);

  callHandlers.close();
  expect(Object.values(callManager.calls).length).toBe(0);
  expect(Object.values(callManager.streams).length).toBe(0);
});

test('[CallManager] Test Call Manager Audio Streams', async () => {
  const handlers = {};
  const mockClient = {
    on: (evt, handler) => {
      handlers[evt] = handler;
    },
  };

  const callManager = new CallManager(() => {});
  callManager.setup(mockClient);
  expect(callManager.state).toBe(CallManager.State.READY);
  expect(callManager.audioMixer.source).toBeUndefined();

  const stream = {};
  callManager.addAudioStream(stream);
  expect(callManager.audioMixer.source).toBeDefined();
  callManager.removeAudioStream();
  expect(callManager.audioMixer.source).toBeUndefined();
});
