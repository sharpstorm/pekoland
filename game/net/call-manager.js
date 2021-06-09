/* eslint-disable no-extra-bind */
export default class CallManager {
  constructor() {
    this.client = undefined;
    this.calls = {};
    this.streams = {};
    this.state = CallManager.State.CREATED;
  }

  setup(client) {
    this.client = client;
    client.on('call', ((call) => {
      console.log(`[CallManager] Incoming call from peer ${call.peer}`);
      call.answer();
      this.registerCall(call);
    }).bind(this));
    this.state = CallManager.State.READY;
  }

  registerCall(call) {
    const peerId = call.peer;
    this.calls[peerId] = call;
    console.log(`[CallManager] Registered peer ${peerId}`);

    call.on('close', (() => {
      this.dispose(peerId);
    }).bind(this));

    call.on('stream', ((stream) => {
      this.streams[peerId] = stream;
    }).bind(this));
  }

  callPeer(peerId) {
    if (peerId in this.calls) {
      return this.calls[peerId];
    }
    const call = this.client.call(peerId, new MediaStream());
    this.registerCall(call);
    return call;
  }

  endCall(peerId) {
    if (peerId in this.calls) {
      this.calls[peerId].close();
    }
    if (peerId in this.streams) {
      this.streams[peerId].close();
    }
  }

  endAllCalls() {
    Object.keys(this.calls).forEach((x) => { this.calls[x].close(); });
  }

  dispose(peerId) {
    console.log(`[CallManager] Disposing peer ${peerId}`);
    if (peerId in this.calls) {
      this.calls[peerId].close();
      delete this.calls[peerId];
    }
    if (peerId in this.streams) {
      this.streams[peerId].close();
      delete this.streams[peerId];
    }
  }

  getConnectedPeers() {
    return Array.from(Object.keys(this.calls));
  }
}

CallManager.State = {
  CREATED: 0,
  READY: 1,
  CONNECTED: 2,
};
