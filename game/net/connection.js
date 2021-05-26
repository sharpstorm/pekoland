import { timeout } from './utils.js';

const configuration = {
  iceServers: [{urls: 'stun:stun.l.google.com:19302'}]
};
const CONN_TIMEOUT = 10000;

//https://peerjs.com/docs.html#api

class Connection {
  constructor(client, target) {
    this.id = 
    this.client = client;
    this.target = target;
    this.conn = undefined;
    this.state = Connection.State.CREATED;
  }

  connect() {
    this.state = Connection.State.CONNECTING;
    return new Promise((resolve, reject) => {
      timeout(new Promise(((res, rej) => {
        this.conn = this.client.connect(this.target);
        this.conn.on('open', () => {
          res(this.conn);
        });
      }).bind(this)), CONN_TIMEOUT)
        .then((() => {
          this.state = Connection.State.CONNECTED;
          console.log('[Connection] Connected to Peer');
          resolve(this.conn);
        }).bind(this))
        .catch(((err) => {
          this.state = Connection.State.CREATED;
          console.error('[Connection] Failed to Connect to Peer');
          reject(err);
        }).bind(this));
    });
  }

  send(data) {
    this.conn.send(data);
  }

  setDataHandler(handler) {
    this.conn.on('data', this.handlerAdapter(handler));
  }

  handlerAdapter(handler) {
    return (data => {
      console.log('hi');
      handler(data, this);
    }).bind(this);
  }
}

Connection.State = {
  CREATED: 0,
  CONNECTING: 1,
  CONNECTED: 2,
  DEAD: 3
}

class BroadcastConnection {
  constructor() {
    this.connections = {};
    this.dataHandler = undefined;
  }

  registerConnection(conn) {
    const peerId = conn.peer;
    this.connections[peerId] = conn;
    conn.on('close', (() => {
      this.dispose(peerId);
    }).bind(this));

    if (this.dataHandler !== undefined) {
      conn.on('data', this.handlerAdapter(conn));
    }
  }

  dispose(peerId) {
    if (peerId in this.connections) {
      this.connections[peerId].close();
      delete this.connections[peerId];
    }
  }

  send(data) {
    Object.values(this.connections).forEach(conn => conn.send(data));
  }

  sendAllExcept(data, peerId) {
    Object.values(this.connections).forEach(conn => { 
      if (conn.peer === peerId) return;
      conn.send(data)
    });
  }

  setDataHandler(handler) {
    this.dataHandler = handler;
    Object.values(this.connections).forEach((conn => {
      conn.on('data', this.handlerAdapter(conn));
    }).bind(this));
  }

  handlerAdapter(conn) {
    return (data => this.dataHandler(data, conn)).bind(this);
  }
}

export { Connection as default, BroadcastConnection }