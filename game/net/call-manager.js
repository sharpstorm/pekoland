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
  constructor() {
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
      console.log(`[CallManager] Incoming call from peer ${call.peer}`);
      call.answer(this.sendStream);
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
      console.log(`[CallManager] Audio Stream from Peer ${peerId}`);
      console.log(stream.getTracks().length);
      const audio = new Audio();
      audio.srcObject = stream;
      document.body.appendChild(audio);
      audio.autoplay = true;
      audio.play();
      this.streams[peerId] = stream;
    }).bind(this));
  }

  callPeer(peerId) {
    if (peerId in this.calls) {
      return this.calls[peerId];
    }
    const call = this.client.call(peerId, this.sendStream);
    this.registerCall(call);
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
    console.log(`[CallManager] Disposing peer ${peerId}`);
    if (peerId in this.calls) {
      delete this.calls[peerId];
    }
    if (peerId in this.streams) {
      delete this.streams[peerId];
    }
  }

  getConnectedPeers() {
    return Array.from(Object.keys(this.calls));
  }

  addAudioStream(stream) {
    console.log('[CallManager] Registering audio stream');
    this.audioMixer.addStream(stream);
    console.log(this.sendStream);
  }

  removeAudioStream() {
    console.log('[CallManager] Removing audio stream');
    this.audioMixer.removeStream();
  }
}

CallManager.State = {
  CREATED: 0,
  READY: 1,
  CONNECTED: 2,
};
