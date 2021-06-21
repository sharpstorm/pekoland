export default class InputSystem {
  constructor(canvas, doc) {
    this.canvas = canvas;
    this.doc = doc;
    this.enabled = true;
    this.handlers = {};
    Object.values(InputSystem.Events).forEach((x) => {
      this.handlers[x] = [];
    });
    this.attached = [];
  }

  attachEvent(evtId) {
    if (evtId === InputSystem.Events.CLICK
      || evtId === InputSystem.Events.DOUBLE_CLICK
      || evtId === InputSystem.Events.MOUSE_DOWN
      || evtId === InputSystem.Events.MOUSE_UP
      || evtId === InputSystem.Events.MOUSE_MOVE
      || evtId === InputSystem.Events.DRAG
      || evtId === InputSystem.Events.DRAG_START
      || evtId === InputSystem.Events.DRAG_END) {
      this.canvas.addEventListener(evtId, (evt) => this.handleEvent(evtId, evt));
    } else {
      this.doc.addEventListener(evtId, (evt) => this.handleEvent(evtId, evt));
    }
  }

  addListener(evt, handler) {
    if (!Object.values(InputSystem.Events).includes(evt)) {
      throw new Error('Invalid Event');
    }

    if (!this.attached.includes(evt)) {
      this.attachEvent(evt);
      this.attached.push(evt);
    }

    this.handlers[evt].push(handler);
  }

  removeListener(evt, handler) {
    if (!Object.values(InputSystem.Events).includes(evt)) {
      throw new Error('Invalid Event');
    }

    this.handlers[evt] = this.handlers[evt].filter((x) => x !== handler);
  }

  handleEvent(evtId, evt) {
    this.handlers[evtId].forEach((x) => x(evt));
  }
}

InputSystem.Events = {
  CLICK: 'click',
  DOUBLE_CLICK: 'dblclick',
  MOUSE_DOWN: 'mousedown',
  MOUSE_UP: 'mouseup',
  MOUSE_MOVE: 'mousemove',
  DRAG: 'drag',
  DRAG_START: 'dragstart',
  DRAG_END: 'dragend',
  BLUR: 'blur',
  FOCUS: 'focus',

  KEY_PRESS: 'keypress',
  KEY_DOWN: 'keydown',
  KEY_UP: 'keyup',
};
