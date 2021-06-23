import { expect, jest, test } from '@jest/globals';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import { TextInput, Button } from '../components/forms/form-components';

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

test('[React-Form] Test Form Button', () => {
  // Test Content
  act(() => {
    render(<Button>Hello</Button>, container);
  });
  expect(container.childNodes.length).toBe(1);
  expect(container.textContent).toBe('Hello');

  // Test Classname append
  act(() => {
    render(<Button className="btn-primary">Hello</Button>, container);
  });
  expect(container.childNodes.length).toBe(1);
  expect(container.childNodes[0].className).toBe('btn btn-primary');

  // Test Props propagation
  act(() => {
    render(<Button style={{ display: 'none' }}>Hello</Button>, container);
  });
  expect(container.childNodes.length).toBe(1);
  expect(container.childNodes[0].style.display).toBe('none');
});

test('[React-Form] Test Input', () => {
  // Test Basic Structure
  act(() => {
    render(<TextInput type="text" value="testVal" placeholder="testP" />, container);
  });
  expect(container.childNodes.length).toBe(1);
  expect(container.childNodes[0].type).toBe('text');
  expect(container.childNodes[0].value).toBe('testVal');
  expect(container.childNodes[0].placeholder).toBe('testP');

  // Test Style and Disabled propagation
  act(() => {
    render(<TextInput type="text" style={{ display: 'none' }} disabled />, container);
  });
  expect(container.childNodes.length).toBe(1);
  expect(container.childNodes[0].style.display).toBe('none');
  expect(container.childNodes[0].disabled).toBe(true);

  // Test Change Handler
  const handler = jest.fn();
  handler.mockImplementation((evt) => {
    expect(evt.target.value).toBe('test');
  });

  act(() => {
    render(<TextInput type="text" value="what" onChange={handler} />, container);
  });
  expect(container.childNodes.length).toBe(1);

  const item = container.childNodes[0];
  act(() => {
    item.value = 'test';
    Simulate.change(item);
  });

  expect(item.value).toBe('test');
  expect(handler).toHaveBeenCalled();
});
