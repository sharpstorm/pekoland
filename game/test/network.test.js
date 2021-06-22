import { expect, jest, test } from '@jest/globals';
import Connection, { BroadcastConnection } from '../net/connection';
import NetworkManager from '../net/network-manager';
import ConfigStore from '../net/config-store';
import CallManager from '../net/call-manager';

jest.mock('../net/config-store');
jest.mock('../net/call-manager');

const TEST_TARGET = 'abcde';
const TEST_RECV = 'teststring';
const TEST_SEND = 'testsend';

test('[Network] Test Connection Object', async () => {
  const handlers = {};
  const send = jest.fn();
  send.mockImplementation((data) => {
    expect(data).toBe(TEST_SEND);
  });

  const receiver = jest.fn();
  receiver.mockImplementation((data) => {
    expect(data).toBe(TEST_RECV);
  });

  const mockClient = {
    connect: (target) => {
      expect(target).toBe(TEST_TARGET);

      const on = (evt, handler) => {
        handlers[evt] = handler;
      };
      return { on, send };
    },
  };

  const fireEvent = (evt, arg) => {
    if (evt in handlers) {
      handlers[evt](arg);
    }
  };

  // Test Bindings
  const conn = new Connection(mockClient, TEST_TARGET);
  expect(Object.keys(handlers).length).toBe(0);
  expect(conn.state).toBe(Connection.State.CREATED);

  const promise = conn.connect();
  expect(conn.state).toBe(Connection.State.CONNECTING);
  expect(Object.keys(handlers).length).toBe(1); // Open

  fireEvent('open');
  await promise;
  expect(conn.state).toBe(Connection.State.CONNECTED);
  expect(Object.keys(handlers).length).toBe(2);

  conn.setDataHandler(receiver);
  expect(Object.keys(handlers).length).toBe(3);

  // Test Actions
  conn.send(TEST_SEND);
  expect(send).toHaveBeenCalled();

  fireEvent('data', TEST_RECV);
  expect(receiver).toHaveBeenCalled();
});

/* jest.setTimeout(11000);
test('[Network] Test Connection Fail', async () => {
  const mockClient = {
    connect: () => {
      const on = () => {};
      return { on, send: on };
    },
  };

  const conn = new Connection(mockClient, TEST_TARGET);
  return expect(conn.connect()).rejects.toBeUndefined();
}); */

jest.setTimeout(5000);
test('[Network] Test BroadcastConnection', () => {
  const mockConn = (id) => {
    const handlers = {};

    const send = jest.fn();
    send.mockImplementation((data) => {
      expect(data).toBe(TEST_SEND);
    });

    const fire = (evt, data) => {
      if (evt in handlers) {
        handlers[evt](data);
      }
    };

    const on = (evt, handler) => {
      handlers[evt] = handler;
    };

    const close = () => {

    };

    return [{
      on,
      send,
      close,
      peer: id,
    }, send, fire];
  };

  const [conn1, send1, fire1] = mockConn('a1');
  const [conn2, send2] = mockConn('b2');
  const [conn3, send3, fire3] = mockConn('c3');

  const conn = new BroadcastConnection();
  expect(Object.values(conn.connections).length).toBe(0);

  conn.registerConnection(conn1);
  conn.registerConnection(conn2);
  conn.registerConnection(conn3);
  expect(Object.values(conn.connections).length).toBe(3);

  // Global Broadcast
  conn.send(TEST_SEND);
  expect(send1).toHaveBeenCalled();
  expect(send2).toHaveBeenCalled();
  expect(send3).toHaveBeenCalled();

  send1.mockClear();
  send2.mockClear();
  send3.mockClear();

  // Broadcast Except
  conn.sendAllExcept(TEST_SEND, 'a1');
  expect(send1).not.toHaveBeenCalled();
  expect(send2).toHaveBeenCalled();
  expect(send3).toHaveBeenCalled();

  send1.mockClear();
  send2.mockClear();
  send3.mockClear();

  // Unicast
  conn.sendTo(TEST_SEND, 'b2');
  expect(send1).not.toHaveBeenCalled();
  expect(send2).toHaveBeenCalled();
  expect(send3).not.toHaveBeenCalled();

  // Handling
  const handler1 = jest.fn();
  handler1.mockImplementation((data, from) => {
    expect(data).toBe(TEST_RECV);
    expect(from.peer).toBe('a1');
  });
  conn.setDataHandler(handler1);

  fire1('data', TEST_RECV);
  expect(handler1).toHaveBeenCalled();

  // Cleanup Handler
  const handler2 = jest.fn();
  handler2.mockImplementation((id) => {
    expect(id).toBe('c3');
  });

  conn.addCleanupHandler(handler2);
  fire3('close');
  expect(handler2).toHaveBeenCalled();
  expect(Object.values(conn.connections).length).toBe(2);
});

test('[Network] Test NetworkManager Server Mode', async () => {
  const netManager = new NetworkManager();
  expect(netManager.state).toBe(NetworkManager.State.CREATED);
  expect(netManager.mode).toBe(NetworkManager.Mode.UNSET);

  const initializedEvent = jest.fn();
  const connectedEvent = jest.fn();
  const modeChangeEvent = jest.fn();
  const updateRemote = jest.fn();

  netManager.on('initialized', initializedEvent);
  netManager.on('clientConnected', connectedEvent);
  netManager.on('modeChanged', modeChangeEvent);

  // Override configstore
  netManager.configStore = {
    updateConfig: () => new Promise((resolve) => {
      resolve();
    }),
    updateRemote,
    opMode: ConfigStore.Mode.SERVER,
    freeze: () => {},
  };

  const handlers = {};
  global.Peer = class {
    // eslint-disable-next-line class-methods-use-this
    on(evt, handler) {
      handlers[evt] = handler;
    }

    // eslint-disable-next-line class-methods-use-this
    connect() {
      return new Promise((resolve) => resolve());
    }
  };

  const fire = (evt, arg) => {
    if (evt in handlers) {
      handlers[evt](arg);
    }
  };

  // Test Setup
  const setupPromise = netManager.setup();
  fire('open', TEST_TARGET);
  await setupPromise;

  expect(netManager.mode).toBe(NetworkManager.Mode.SERVER);
  expect(netManager.peerId).toBe(TEST_TARGET);
  expect(netManager.state).toBe(NetworkManager.State.READY);
  expect(modeChangeEvent).toHaveBeenCalled();
  expect(initializedEvent).toHaveBeenCalled();
  expect(updateRemote).toHaveBeenCalled();

  const connHandlers = {};
  const on = (evtId, handler) => {
    connHandlers[evtId] = handler;
  };
  const connSend = jest.fn();
  const fireConnEvent = (evt, args) => {
    if (evt in connHandlers) {
      connHandlers[evt](args);
    }
  };

  // Test Incoming Conn
  const close = () => {};
  fire('connection', { on, close, send: connSend });
  expect(Object.keys(netManager.connection.connections).length).toBe(0);
  fireConnEvent('open');
  expect(Object.keys(netManager.connection.connections).length).toBe(1);
  expect(connectedEvent).toHaveBeenCalled();

  // Test send propagation
  netManager.send('test');
  expect(connSend).toHaveBeenCalled();

  // Test Cleanup
  const cleanupHandler = jest.fn();
  netManager.addCleanupHandler(cleanupHandler);
  fireConnEvent('close');
  expect(cleanupHandler).toHaveBeenCalled();
  expect(Object.keys(netManager.connection.connections).length).toBe(0);
});

test('[Network] Test NetworkManager Client Mode', async () => {
  const netManager = new NetworkManager();
  expect(netManager.state).toBe(NetworkManager.State.CREATED);
  expect(netManager.mode).toBe(NetworkManager.Mode.UNSET);

  const initializedEvent = jest.fn();
  const connectEvent = jest.fn();
  const connectedEvent = jest.fn();
  const modeChangeEvent = jest.fn();

  netManager.on('initialized', initializedEvent);
  netManager.on('connect', connectEvent);
  netManager.on('connected', connectedEvent);
  netManager.on('modeChanged', modeChangeEvent);

  // Override configstore
  netManager.configStore = {
    updateConfig: () => new Promise((resolve) => {
      resolve();
    }),
    updateRemote: () => {},
    opMode: ConfigStore.Mode.CLIENT,
    freeze: () => {},
    peerConnectionString: 'abbb',
  };

  const handlers = {};
  global.Peer = class {
    // eslint-disable-next-line class-methods-use-this
    on(evt, handler) {
      handlers[evt] = handler;
    }
  };

  const fire = (evt, arg) => {
    if (evt in handlers) {
      handlers[evt](arg);
    }
  };

  expect(netManager.initConnection()).toBeUndefined();

  // Test Setup
  const setupPromise = netManager.setup();
  fire('open', TEST_TARGET);
  await setupPromise;

  expect(netManager.mode).toBe(NetworkManager.Mode.CLIENT);
  expect(netManager.peerId).toBe(TEST_TARGET);
  expect(netManager.state).toBe(NetworkManager.State.INITIALIZED);
  expect(modeChangeEvent).toHaveBeenCalled();
  expect(initializedEvent).toHaveBeenCalled();

  const handlers2 = {};
  const connSend = jest.fn();
  const mockClient = {
    connect: () => {
      const on = (evt, handler) => {
        handlers2[evt] = handler;
      };
      return { on, send: connSend };
    },
  };

  // Start Connect process
  netManager.peer = mockClient;
  const promise = netManager.initConnection();
  expect(netManager.state).toBe(NetworkManager.State.CONNECTING);
  expect(connectEvent).toHaveBeenCalled();
  expect(netManager.initConnection()).toBeUndefined();

  // Open Connection
  handlers2.open();
  await promise;
  expect(netManager.state).toBe(NetworkManager.State.READY);
  expect(connectedEvent).toHaveBeenCalled();
  expect(netManager.initConnection()).toBeUndefined();

  // Test send propagation
  netManager.send('test');
  expect(connSend).toHaveBeenCalled();
});
