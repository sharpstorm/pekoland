import mockCanvas from './mock-canvas';

if (global.document) {
  mockCanvas(window);
  document.body.innerHTML = '<canvas id="game"></canvas>';
}