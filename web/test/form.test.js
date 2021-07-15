import { expect, jest, test } from '@jest/globals';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import {
  TextInput,
  TextAreaInput,
  Select,
  Button,
} from '../components/forms/form-components';

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

test('[React-Form] Test Text Area Input', () => {
  // Test Basic Structure
  act(() => {
    render(<TextAreaInput value="testVal" rows="20" />, container);
  });
  expect(container.childNodes.length).toBe(1);
  expect(container.childNodes[0].type).toBe('textarea');
  expect(container.childNodes[0].value).toBe('testVal');
  expect(container.childNodes[0].rows).toBe(20);

  // Test Style, Disabled and ReadOnly propagation
  act(() => {
    render(<TextAreaInput style={{ display: 'none' }} disabled readOnly />, container);
  });
  expect(container.childNodes.length).toBe(1);
  expect(container.childNodes[0].style.display).toBe('none');
  expect(container.childNodes[0].disabled).toBe(true);
  expect(container.childNodes[0].readOnly).toBe(true);

  // Test Change Handler
  const handler = jest.fn();
  handler.mockImplementation((evt) => {
    expect(evt.target.value).toBe('test');
  });

  act(() => {
    render(<TextAreaInput value="what" onChange={handler} />, container);
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

test('[React-Form] Test Select Input', () => {
  // Test Basic Structure
  const listItems = ['a1', 'b2', 'c3'];
  act(() => {
    render(<Select options={listItems} selectedIndex="1" />, container);
  });
  expect(container.childNodes.length).toBe(1);
  expect(container.childNodes[0].type).toBe('select-one');
  const select = container.childNodes[0];
  expect(select.childNodes.length).toBe(3);
  expect(select.childNodes[0].value).toBe('0');
  expect(select.childNodes[0].textContent).toBe('a1');
  expect(select.childNodes[1].value).toBe('1');
  expect(select.childNodes[1].textContent).toBe('b2');
  expect(select.childNodes[2].value).toBe('2');
  expect(select.childNodes[2].textContent).toBe('c3');
  expect(select.value).toBe('1');

  // Test Style propagation
  act(() => {
    render(<Select options={listItems} style={{ display: 'none' }} disabled readOnly />, container);
  });
  expect(container.childNodes.length).toBe(1);
  expect(container.childNodes[0].style.display).toBe('none');

  // Test Change Handler
  const handler = jest.fn();
  handler.mockImplementation((evt) => {
    expect(evt.target.value).toBe('2');
  });

  act(() => {
    render(<Select options={listItems} selectedIndex="1" onChange={handler} />, container);
  });
  expect(container.childNodes.length).toBe(1);

  const item = container.childNodes[0];
  expect(item.value).toBe('1');
  act(() => {
    item.value = '2';
    Simulate.change(item);
  });

  expect(item.value).toBe('2');
  expect(handler).toHaveBeenCalled();
});
