import { expect, test } from '@jest/globals';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import BackgroundOverlay from '../components/background-overlay';
import { ArrowLeft } from '../components/icons';
import Logo from '../components/logo';

let container = null;

// eslint-disable-next-line no-undef
beforeEach(() => {
  // Setup container
  container = document.createElement('div');
  document.body.appendChild(container);
});

// eslint-disable-next-line no-undef
afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

test('[React-Static] Test Static Icon', () => {
  const size = '24px';
  const color = 'salmon';
  act(() => {
    render(<ArrowLeft size={size} color={color} />, container);
  });

  expect(container.childNodes.length).toBe(1);
  expect(container.firstChild.nodeName.toLowerCase()).toBe('svg');
  expect(container.firstChild.style.width).toBe(size);
  expect(container.firstChild.style.height).toBe(size);

  expect(container.firstChild.firstChild.nodeName.toLowerCase()).toBe('path');
  expect(container.firstChild.firstChild.style.fill).toBe(color);
});

test('[React-Static] Test Static Logo', () => {
  act(() => {
    render(<Logo />, container);
  });

  expect(container.childNodes.length).toBe(1);
  expect(container.firstChild.nodeName.toLowerCase()).toBe('div');
  expect(container.firstChild.firstChild.nodeName.toLowerCase()).toBe('img');

  act(() => {
    render(<Logo style={{ display: 'none' }} />, container);
  });

  expect(container.firstChild.style.display).toBe('none');
});

test('[React-Static] Test Static Background', () => {
  act(() => {
    render(<BackgroundOverlay />, container);
  });

  expect(container.childNodes.length).toBe(1);
  expect(container.firstChild.nodeName.toLowerCase()).toBe('div');
  const layers = container.firstChild.childNodes;
  expect(layers.length).toBe(3);
  expect(layers[0].nodeName.toLowerCase()).toBe('div'); // Gradient BG
  expect(layers[1].nodeName.toLowerCase()).toBe('img'); // Mountains
  expect(layers[2].nodeName.toLowerCase()).toBe('img'); // Trees

  expect(container.firstChild.className).toBe('bg-overlay');

  act(() => {
    render(<BackgroundOverlay isVisible={false} />, container);
  });

  expect(container.firstChild.className).toBe('bg-overlay disappear');
});
