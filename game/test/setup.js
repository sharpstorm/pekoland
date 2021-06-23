import { jest } from '@jest/globals';

import mockCanvas from './mock-canvas';

if (global.document) {
  mockCanvas(window);
  document.body.innerHTML = '<canvas id="game"></canvas><div id="ui-overlay"></div>';
}

global.console = {
  log: jest.fn(),

  error: jest.fn(),
  warn: console.warn,
  info: console.info,
  debug: jest.fn(),
};
