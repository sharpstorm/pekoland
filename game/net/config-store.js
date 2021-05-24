const BROADCAST_CHANNEL_ID = 'pekoland-data';

// Receive Message Headers
const RECVOP_CONFIG_CHANGED = 'pekoconn-config-changed';

// Send Message Headers
const SENDOP_CONFIG_REQUEST = 'pekoconn-config-request';

export default class ConfigStore {
  constructor() {
    this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_ID);
    this.peerConnectionString = undefined;

    this.setup();
  }

  setup() {
    this.broadcastChannel.onmessage = (ev) => {
      if (!ev.data || !ev.data.op) return;
      let data = ev.data;

      if (data.op === RECVOP_CONFIG_CHANGED) {
        this.peerConnectionString = data.partnerString;
        console.log('[NetworkConfig] Peer String Changed');
      }
    }
  }

  updateConfig() {
    this.broadcastChannel.postMessage({
      op: SENDOP_CONFIG_REQUEST
    })
  }
}