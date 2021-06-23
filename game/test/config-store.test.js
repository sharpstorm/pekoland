import { expect, jest, test } from '@jest/globals';
import ConfigStore from '../net/config-store';

const TEST_PEERID = '1234567';
const TEST_USERID = 'abcd';
const TEST_NAME = 'testname';
const TEST_OPMODE = ConfigStore.Mode.SERVER;

test('[ConfigStore] Test Configuration Transfer', async () => {
  window.location.hash = '#abcdef';
  const remoteReceiver = jest.fn();

  global.BroadcastChannel = class {
    constructor(channelId) {
      expect(channelId).toBe('pekoland-data');
    }

    // eslint-disable-next-line class-methods-use-this
    postMessage(msg) {
      remoteReceiver(msg);
    }
  };
  const configStore = new ConfigStore();
  expect(configStore.subchannelId).toBe('abcdef');
  expect(configStore.broadcastChannel).toBeDefined();
  expect(configStore.broadcastChannel.onmessage).toBeDefined();

  remoteReceiver.mockImplementationOnce((msg) => {
    expect(msg.op).toBe('pekoconn-update-peerid');
    expect(msg.peerId).toBe(TEST_PEERID);
  });
  configStore.updateRemote(TEST_PEERID);
  expect(remoteReceiver).toHaveBeenCalled();

  remoteReceiver.mockReset();
  let name = TEST_NAME;
  remoteReceiver.mockImplementation((msg) => {
    expect(msg.op).toBe('pekoconn-config-request');
    configStore.broadcastChannel.onmessage({
      data: {
        op: 'pekoconn-config-changed',
        channel: 'abcdef',
        partnerString: TEST_PEERID,
        userId: TEST_USERID,
        name,
        opMode: TEST_OPMODE,
      },
    });
  });

  // Test Listener at same time
  configStore.listener = (connString) => {
    expect(connString).toBe(TEST_PEERID);
  };
  await configStore.updateConfig();
  expect(remoteReceiver).toHaveBeenCalled();

  // Test Freezing
  name = 'otheruser';
  configStore.freeze();
  remoteReceiver({ op: 'pekoconn-config-request' });
  expect(configStore.name).toBe(TEST_NAME);

  // Test resume
  configStore.resume();
  remoteReceiver({ op: 'pekoconn-config-request' });
  expect(configStore.name).toBe(name);

  // Test Channel Rejection
  configStore.subchannelId = 'a';
  remoteReceiver({ op: 'pekoconn-config-request' });
  expect(configStore.name).toBe(name);

  // Test Busy Rejection
  remoteReceiver.mockReset();
  remoteReceiver.mockImplementation((msg) => {
    expect(msg.op).toBe('pekoconn-config-request');
  });

  configStore.updateConfig();
  expect(configStore.updateConfig()).rejects.toThrow('[NetworkConfig] Config Worker is Busy');

  global.BroadcastChannel = undefined;
});
