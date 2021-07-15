import { expect, test } from '@jest/globals';
import React from 'react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
// eslint-disable-next-line import/no-unresolved
import { IdentityContext } from 'react-netlify-identity-auth';
import HomeView from '../components/view-home';

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

test('[React-Portal] Test Home Page', () => {
  const history = createMemoryHistory();

  const renderApp = () => {
    unmountComponentAtNode(container);
    render(
      <Router history={history}>
        <IdentityContext.Provider
          value={{
            user: {
              user_metadata: {
                ign: 'User 1',
              },
              ready: true,
            },
          }}
        >
          <HomeView />
        </IdentityContext.Provider>
      </Router>,
      container,
    );
  };

  history.push('/home');
  act(renderApp);

  const tileContainer = container.getElementsByClassName('container')[0];
  expect(tileContainer.childNodes.length).toBe(2);
  const row1 = tileContainer.childNodes[0];
  const row2 = tileContainer.childNodes[1];
  expect(row1.childNodes.length).toBe(2);
  expect(row2.childNodes.length).toBe(2);
  expect(row1.childNodes[0].textContent).toBe('Friends');
  expect(row1.childNodes[1].textContent).toBe('Mail');
  expect(row2.childNodes[0].textContent).toBe('Start Game');
  expect(row2.childNodes[1].textContent).toBe('Contact Admins');
});

test('[React-Portal] Test Home Page Admin', () => {
  const history = createMemoryHistory();

  const renderApp = () => {
    unmountComponentAtNode(container);
    render(
      <Router history={history}>
        <IdentityContext.Provider
          value={{
            user: {
              user_metadata: {
                ign: 'User 1',
              },
              app_metadata: {
                roles: ['admin'],
              },
            },
            ready: true,
          }}
        >
          <HomeView />
        </IdentityContext.Provider>
      </Router>,
      container,
    );
  };

  history.push('/home');
  act(renderApp);

  const tileContainer = container.getElementsByClassName('container')[0];
  expect(tileContainer.childNodes.length).toBe(2);
  const row1 = tileContainer.childNodes[0];
  const row2 = tileContainer.childNodes[1];
  expect(row1.childNodes.length).toBe(2);
  expect(row2.childNodes.length).toBe(2);
  expect(row1.childNodes[0].textContent).toBe('Friends');
  expect(row1.childNodes[1].textContent).toBe('Mail');
  expect(row2.childNodes[0].textContent).toBe('Start Game');
  expect(row2.childNodes[1].textContent).toBe('Admin Panel');
});
