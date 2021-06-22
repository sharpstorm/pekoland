/* eslint-disable no-extra-bind */

import CallManager from './call-manager.js';
import ConfigStore from './config-store.js';
import Connection, { BroadcastConnection } from './connection.js';

const WEBRTC_CONFIG = {
  iceServers: [
    { url: 'stun:stun.l.google.com:19302' },
  ],
};

let instance;
export default class NetworkManager {
  constructor() {
    this.configStore = new ConfigStore();
    this.callManager = new CallManager(this.emitEvent.bind(this));
    this.connection = undefined;
    this.state = NetworkManager.State.CREATED;
    this.mode = NetworkManager.Mode.UNSET;
    this.listeners = {};
  }

  setup() {
    const configPromise = this.configStore.updateConfig().then((() => {
      this.configStore.freeze();
      this.mode = (this.configStore.opMode === ConfigStore.Mode.SERVER)
        ? NetworkManager.Mode.SERVER : NetworkManager.Mode.CLIENT;

      this.emitEvent(NetworkManager.Events.MODE_CHANGED, this.mode);
    }).bind(this));
    const peerPromise = new Promise(((resolve) => {
      // eslint-disable-next-line no-undef
      this.peer = new Peer(WEBRTC_CONFIG);
      this.callManager.setup(this.peer);
      this.peer.on('open', ((id) => {
        this.peerId = id;
        console.log(`[NetworkManager] My Peer ID: ${id}`);
        resolve(id);
      }).bind(this));
    }).bind(this));

    return Promise.all([configPromise, peerPromise])
      .then((() => {
        if (this.mode === NetworkManager.Mode.SERVER) {
          this.hookServerHandlers();
          this.state = NetworkManager.State.READY;
        } else {
          this.state = NetworkManager.State.INITIALIZED;
        }
        this.emitEvent(NetworkManager.Events.INITIALIZED);
      }).bind(this));
  }

  hookServerHandlers() {
    this.connection = new BroadcastConnection();

    this.peer.on('connection', ((dataConnection) => {
      dataConnection.on('open', (() => {
        console.log('[NetworkManager] Connection with Remote Peer Established');
        this.connection.registerConnection(dataConnection);
        this.emitEvent(NetworkManager.Events.CLIENT_CONNECTED, dataConnection);
      }).bind(this));
    }).bind(this));

    this.configStore.updateRemote(this.peerId);
    window.onbeforeunload = () => {
      this.configStore.updateRemote('');
    };
  }

  addCleanupHandler(handler) {
    if (this.mode === NetworkManager.Mode.SERVER && this.connection !== undefined) {
      return this.connection.addCleanupHandler(handler);
    }
    return undefined;
  }

  initConnection() {
    let error;
    if (this.state < NetworkManager.State.INITIALIZED) {
      error = '[NetworkManager] Library has not finished initialising';
    } else if (this.state === NetworkManager.State.CONNECTING) {
      error = '[NetworkManager] Currently already attempting to connect';
    } else if (this.connection || this.state > NetworkManager.State.INITIALIZED) {
      error = '[NetworkManager] A Connection is already established!';
    } else if (!this.configStore.peerConnectionString) {
      error = '[NetworkManager] Partner Configuration Not Set';
    }

    if (error) {
      console.error(error);
      return undefined;
    }

    this.emitEvent(NetworkManager.Events.CONNECT);
    this.connection = new Connection(this.peer, this.configStore.peerConnectionString);
    this.state = NetworkManager.State.CONNECTING;
    return this.connection.connect().then((() => {
      this.state = NetworkManager.State.READY;
      this.emitEvent(NetworkManager.Events.CONNECTED);
    }).bind(this))
      .catch(() => {
        this.state = NetworkManager.State.INITIALIZED;
        this.emitEvent(NetworkManager.Events.CONNECTION_FAILED);
      });
  }

  getOperationMode() {
    return this.mode;
  }

  on(evtId, handler) {
    if (Object.values(NetworkManager.Events).includes(evtId)
      || Object.values(CallManager.Events).includes(evtId)) {
      this.listeners[evtId] = handler;
    } else {
      console.error('[NetworkManager] Invalid Event ID for Listener');
    }
  }

  emitEvent(evtId, data) {
    if (this.listeners[evtId]) {
      this.listeners[evtId](data);
    }
  }

  send(data) {
    if (this.connection) {
      this.connection.send(data);
    }
  }

  getConnection() {
    return this.connection;
  }

  getCallManager() {
    return this.callManager;
  }

  getSelfPeerId() {
    return this.peerId;
  }

  setDataHandler(handler) {
    if (this.connection) {
      this.connection.setDataHandler(handler);
    }
  }

  connectVoice(peerId) {
    if (this.state !== NetworkManager.State.CREATED) {
      this.callManager.callPeer(peerId);
    }
  }

  disconnectVoice() {
    if (this.state !== NetworkManager.State.CREATED) {
      this.callManager.endAllCalls();
    }
  }

  static getInstance() {
    if (instance === undefined) {
      instance = new NetworkManager();
    }
    return instance;
  }
}

NetworkManager.State = {
  CREATED: 0,
  INITIALIZED: 1,
  CONNECTING: 2,
  READY: 3,
  DEAD: 4,
};

NetworkManager.Mode = {
  UNSET: 0,
  SERVER: 1,
  CLIENT: 2,
};

NetworkManager.Events = {
  MODE_CHANGED: 'modeChanged',
  INITIALIZED: 'initialized',
  CONNECT: 'connect',
  CONNECTED: 'connected',
  CLIENT_CONNECTED: 'clientConnected',
  CONNECTION_FAILED: 'connectionFailed',
};
