const getDummyContext = () => {
  const history = [];
  const ret = {
    fillStyle: '',
    strokeStyle: '',
    currentX: 0,
    currentY: 0,
  }

  const fillRect = (x, y, width, height) => {
    history.push({ action: 'fillRect', x, y, width, height, color: ret.fillStyle });
  }

  const strokeRect = (x, y, width, height) => {
    history.push({ action: 'strokeRect', x, y, width, height, color: ret.strokeStyle });
  }

  const clearRect = (x, y, width, height) => {
    history.push({ object: 'clearRect', x, y, width, height });
  }

  const rect = (x, y, width, height) => {
    history.push({ action: 'rect', x, y, width, height, color: ret.fillStyle });
  }

  const drawImage = (image, ...params) => {
    history.push({ object: 'drawImage', image, params });
  }

  const fillText = (text, x, y) => {
    history.push({ object: 'text', x, y, text });
  }
  const strokeText = fillText;

  const moveTo = (x, y) => {
    ret.currentX = x;
    ret.currentY = y;
  }

  const lineTo = (x, y) => {
    history.push({
      object: 'line',
      from: [ret.currentX, ret.currentY],
      to: [x, y],
    });
  }

  const stroke = () => {
    history.push({
      object: 'stroke',
    })
  };

  const fill = () => {
    history.push({
      object: 'fill',
    });
  };

  const getImageData = (x, y, w, h) => {
    return  {
      data: new Array(w*h*4)
    };
  };

  const measureText = () => 100;

  const putImageData = () => {};
  const createImageData = () => ([]);
  const setTransform = () => {};
  const beginPath = () => {};
  const closePath = () => {};
  
  const save = () => {};
  const restore = () => {}
  const translate = () => {};
  const scale = () => {};
  const rotate = () => {};
  const transform = () => {};
  const arc = () => {};
  const clip = () => {};

  return {
    fillRect,
    strokeRect,
    clearRect,
    getImageData,
    putImageData,
    createImageData,
    setTransform,
    drawImage,
    save,
    fillText,
    strokeText,
    restore,
    beginPath,
    moveTo,
    lineTo,
    closePath,
    stroke,
    translate,
    scale,
    rotate,
    arc,
    fill,
    measureText,
    transform,
    rect,
    clip,
    history,
  };
}

function mockCanvas (window) {
  window.HTMLCanvasElement.prototype.getContext = getDummyContext;
  window.HTMLCanvasElement.prototype.toDataURL = function () {
      return '';
  }
}

export { mockCanvas as default, getDummyContext };