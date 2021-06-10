/* eslint-disable no-extra-bind */

class AudioMixer {
  constructor() {
    this.ctx = new AudioContext();
    this.merger = this.ctx.createChannelMerger(2);
    this.dest = this.ctx.createMediaStreamDestination();
    this.merger.connect(this.dest);
    this.source = undefined;
  }

  addStream(stream) {
    if (this.source) {
      this.source.disconnect(this.merger);
    }
    this.source = this.ctx.createMediaStreamSource(stream);
    this.source.connect(this.merger);
  }

  removeStream() {
    if (this.source) {
      this.source.disconnect(this.merger);
      this.source = undefined;
    }
  }

  getTrack() {
    const track = this.dest.stream.getAudioTracks()[0];
    return Object.assign(track, { enabled: true });
  }
}

export default class CallManager {
  constructor(emitEvent) {
    this.emitEvent = emitEvent;
    this.client = undefined;
    this.calls = {};
    this.streams = {};
    this.state = CallManager.State.CREATED;
    this.sendStream = new MediaStream();
    this.audioMixer = new AudioMixer();
    this.sendStream.addTrack(this.audioMixer.getTrack());
  }

  setup(client) {
    this.client = client;
    client.on('call', ((call) => {
      console.debug(`[CallManager] Incoming call from peer ${call.peer}`);
      call.answer(this.sendStream);
      this.registerCall(call);
      this.emitEvent(CallManager.Events.CALL_RECEIVED, call.peer);
    }).bind(this));
    this.state = CallManager.State.READY;
  }

  registerCall(call) {
    const peerId = call.peer;
    this.calls[peerId] = call;
    console.debug(`[CallManager] Registered peer ${peerId}`);

    call.on('close', (() => {
      this.dispose(peerId);
    }).bind(this));

    call.on('stream', ((stream) => {
      console.log(`[CallManager] Audio Stream from Peer ${peerId}`);
      this.streams[peerId] = stream;
      this.emitEvent(CallManager.Events.CALL_STREAM_OPEN, { peerId, stream });
    }).bind(this));
  }

  callPeer(peerId) {
    if (peerId in this.calls) {
      return this.calls[peerId];
    }
    const call = this.client.call(peerId, this.sendStream);
    this.registerCall(call);
    this.emitEvent(CallManager.Events.CALL, peerId);
    return call;
  }

  endCall(peerId) {
    if (peerId in this.calls) {
      this.calls[peerId].close();
    }
  }

  endAllCalls() {
    Object.keys(this.calls).forEach((x) => { this.calls[x].close(); });
  }

  dispose(peerId) {
    console.debug(`[CallManager] Disposing peer ${peerId}`);
    if (peerId in this.calls) {
      delete this.calls[peerId];
    }
    if (peerId in this.streams) {
      delete this.streams[peerId];
    }
    this.emitEvent(CallManager.Events.CALL_ENDED, peerId);
  }

  getConnectedPeers() {
    return Array.from(Object.keys(this.calls));
  }

  addAudioStream(stream) {
    console.debug('[CallManager] Registering audio stream');
    this.audioMixer.addStream(stream);
  }

  removeAudioStream() {
    console.debug('[CallManager] Removing audio stream');
    this.audioMixer.removeStream();
  }
}

CallManager.State = {
  CREATED: 0,
  READY: 1,
};

CallManager.Events = {
  CALL: 'call',
  CALL_RECEIVED: 'callReceived',
  CALL_ENDED: 'callEnded',
  CALL_STREAM_OPEN: 'callStreamOpen',
};
