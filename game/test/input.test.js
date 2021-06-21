/**
 * @jest-environment jsdom
 */

import { expect, jest, test } from '@jest/globals';
import InputSystem from '../workers/input-system';

test('Test InputSystem Attach Targets', () => {
  const attachedHandlersA = [];
  const attachedHandlersB = [];

  const eventTargetA = {
    addEventListener: (eventId, handler) => {
      attachedHandlersA.push(eventId);
    },
  };
  const eventTargetB = {
    addEventListener: (eventId, handler) => {
      attachedHandlersB.push(eventId);
    },
  };

  const inputSystem = new InputSystem(eventTargetA, eventTargetB);

  inputSystem.attachEvent(InputSystem.Events.CLICK);
  inputSystem.attachEvent(InputSystem.Events.DOUBLE_CLICK);
  inputSystem.attachEvent(InputSystem.Events.MOUSE_DOWN);
  inputSystem.attachEvent(InputSystem.Events.MOUSE_UP);
  inputSystem.attachEvent(InputSystem.Events.MOUSE_MOVE);
  inputSystem.attachEvent(InputSystem.Events.DRAG);
  inputSystem.attachEvent(InputSystem.Events.DRAG_START);
  inputSystem.attachEvent(InputSystem.Events.DRAG_END);

  inputSystem.attachEvent(InputSystem.Events.BLUR);
  inputSystem.attachEvent(InputSystem.Events.FOCUS);
  inputSystem.attachEvent(InputSystem.Events.KEY_PRESS);
  inputSystem.attachEvent(InputSystem.Events.KEY_DOWN);
  inputSystem.attachEvent(InputSystem.Events.KEY_UP);

  expect(attachedHandlersA).toContain(InputSystem.Events.CLICK);
  expect(attachedHandlersA).toContain(InputSystem.Events.DOUBLE_CLICK);
  expect(attachedHandlersA).toContain(InputSystem.Events.MOUSE_DOWN);
  expect(attachedHandlersA).toContain(InputSystem.Events.MOUSE_UP);
  expect(attachedHandlersA).toContain(InputSystem.Events.MOUSE_MOVE);
  expect(attachedHandlersA).toContain(InputSystem.Events.DRAG);
  expect(attachedHandlersA).toContain(InputSystem.Events.DRAG_START);
  expect(attachedHandlersA).toContain(InputSystem.Events.DRAG_END);

  expect(attachedHandlersB).toContain(InputSystem.Events.BLUR);
  expect(attachedHandlersB).toContain(InputSystem.Events.FOCUS);
  expect(attachedHandlersB).toContain(InputSystem.Events.KEY_PRESS);
  expect(attachedHandlersB).toContain(InputSystem.Events.KEY_DOWN);
  expect(attachedHandlersB).toContain(InputSystem.Events.KEY_UP);
});

test('Test InputSystem Add Listeners', () => {
  const handlers = {};
  const eventTarget = {
    addEventListener: (eventId, handler) => {
      handlers[eventId] = handler;
    },
  };
  const fireEvent = (evtId) => handlers[evtId](); 

  const inputSystem = new InputSystem(eventTarget, eventTarget);
  expect(() => inputSystem.addListener('abc', () => {})).toThrow(new Error('Invalid Event'));

  Object.values(InputSystem.Events)
    .forEach((event) => {
      let ran = false;
      inputSystem.addListener(event, () => {
        ran = true;
      });
      expect(Object.keys(handlers)).toContain(event);
      fireEvent(event);
      expect(ran).toBe(true);
    });
});
