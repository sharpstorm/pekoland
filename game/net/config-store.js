const BROADCAST_CHANNEL_ID = 'pekoland-data';

// Receive Message Headers
const RECVOP_CONFIG_CHANGED = 'pekoconn-config-changed';
const RECVOP_GAME_OP = 'pekoconn-game-reply';

// Send Message Headers
const SENDOP_CONFIG_REQUEST = 'pekoconn-config-request';
const SENDOP_UPDATE_PEERID = 'pekoconn-update-peerid';
const SENDOP_GAME_OP = 'pekoconn-game-op';

export default class ConfigStore {
  constructor() {
    this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_ID);
    if (window.location.hash && window.location.hash.length >= 2) {
      this.subchannelId = window.location.hash.substring(1);
      window.location.hash = '';
    }
    this.userId = undefined;
    this.name = undefined;
    this.peerConnectionString = undefined;
    this.opMode = undefined;
    this.listener = undefined;
    this.isBusy = false;
    this.frozen = false;

    this.setup();
  }

  setup() {
    this.broadcastChannel.onmessage = ((ev) => {
      if (!ev.data || !ev.data.op) return;
      const { data } = ev;
      if (this.subchannelId !== '' && ev.data.channel !== this.subchannelId) return;

      if (data.op === RECVOP_CONFIG_CHANGED && !this.frozen) {
        this.peerConnectionString = data.partnerString;
        this.userId = data.userId;
        this.name = data.name;
        this.opMode = (data.opMode === ConfigStore.Mode.SERVER)
          ? ConfigStore.Mode.SERVER : ConfigStore.Mode.CLIENT;

        console.log('[NetworkConfig] Configuration Received');
        if (this.listener) this.listener(this.peerConnectionString);
        this.isBusy = false;
      } else if (data.op === RECVOP_GAME_OP) {
        if (this.listener) this.listener(data.reply);
        this.isBusy = false;
      }
    });
  }

  updateConfig() {
    return new Promise((resolve, reject) => {
      if (this.isBusy) { // Awaiting Response
        reject(new Error('[NetworkConfig] Config Worker is Busy'));
        return;
      }

      this.listener = resolve;
      this.isBusy = true;
      this.broadcastChannel.postMessage({
        op: SENDOP_CONFIG_REQUEST,
      });
    });
  }

  updateRemote(peerId) {
    this.broadcastChannel.postMessage({
      op: SENDOP_UPDATE_PEERID,
      peerId,
    });
  }

  fetchGameOperation(opCode, data) {
    return new Promise((resolve, reject) => {
      if (this.isBusy) {
        reject(new Error('[NetworkConfig] Config Worker is Busy'));
        return;
      }

      this.listener = resolve;
      this.isBusy = true;
      this.broadcastChannel.postMessage({
        op: SENDOP_GAME_OP,
        payload: {
          op: opCode,
          data,
        },
      });
    });
  }

  freeze() {
    this.frozen = true;
  }

  resume() {
    this.frozen = false;
  }
}

ConfigStore.Mode = {
  SERVER: 1,
  CLIENT: 2,
};
