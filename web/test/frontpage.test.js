import { expect, jest, test } from '@jest/globals';
import React from 'react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { render, unmountComponentAtNode } from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
// eslint-disable-next-line import/no-unresolved
import NetlifyIdentityContext from 'react-netlify-identity-auth';
import FrontPageView from '../components/view-frontpage';

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

test('[React-Frontpage] Routing Test', () => {
  const history = createMemoryHistory();
  const renderApp = () => {
    unmountComponentAtNode(container);
    render(
      <Router history={history}>
        <NetlifyIdentityContext url="https://orbital-2021-pekoland.netlify.app">
          <FrontPageView />
        </NetlifyIdentityContext>
      </Router>,
      container,
    );
  };

  history.push('/login');
  act(renderApp);
  expect(container.textContent).toContain('Forgot Your Password?');

  history.replace('/login/register');
  act(renderApp);
  expect(container.textContent).toContain('Tell Me About Yourself');

  history.replace('/login/forget');
  act(renderApp);
  expect(container.textContent).toContain('Forgotten Password');

  history.replace('/login/reset');
  act(renderApp);
  expect(container.textContent).toContain('Invalid Link');

  history.replace('/login/confirm');
  act(renderApp);
  expect(container.textContent).toContain('Invalid Link');
});

test('[React-Frontpage] Test Login', async () => {
  const history = createMemoryHistory();
  const renderApp = () => {
    render(
      <Router history={history}>
        <NetlifyIdentityContext url="https://orbital-2021-pekoland.netlify.app">
          <FrontPageView />
        </NetlifyIdentityContext>
      </Router>,
      container,
    );
  };

  history.push('/login');
  act(renderApp);
  expect(container.textContent).toContain('Forgot Your Password?');

  expect(document.querySelector('button[type="submit"]').disabled).toBe(true);

  const emailInp = document.querySelector('input[type="email"]');
  const pwdInp = document.querySelector('input[type="password"]');

  // Invalid Email
  act(() => {
    emailInp.value = 'invalidemail';
    pwdInp.value = 'password';
    Simulate.change(emailInp);
    Simulate.change(pwdInp);
  });
  expect(document.querySelector('button[type="submit"]').disabled).toBe(true);

  // Empty Password
  act(() => {
    emailInp.value = 'email@email.com';
    pwdInp.value = '';
    Simulate.change(emailInp);
    Simulate.change(pwdInp);
  });
  expect(document.querySelector('button[type="submit"]').disabled).toBe(true);

  // Valid
  act(() => {
    emailInp.value = 'email@email.com';
    pwdInp.value = 'password123';
    Simulate.change(emailInp);
    Simulate.change(pwdInp);
  });

  expect(document.querySelector('button[type="submit"]').disabled).toBe(false);

  let fetchPromise;
  const oldFetch = global.fetch;
  global.fetch = jest.fn();
  global.fetch.mockImplementationOnce(() => {
    fetchPromise = new Promise((resolve, reject) => {
      reject(new Error('Fail to login'));
    });
    return fetchPromise;
  });
  global.fetch.mockImplementationOnce(() => {
    fetchPromise = new Promise((resolve) => resolve({
      json: () => ({ access_token: 'aaaa.eyJleHAiOiAxMH0=' }),
    }));
    return fetchPromise;
  });

  act(() => {
    Simulate.click(document.querySelector('button[type="submit"]'));
  });

  await expect(fetchPromise).rejects.toThrow(Error);

  act(() => {
    Simulate.click(document.querySelector('button[type="submit"]'));
  });

  const navigationPromise = new Promise((resolve) => {
    const unlisten = history.listen(() => {
      unlisten();
      resolve();
    });
  });

  await navigationPromise;
  expect(global.fetch).toHaveBeenCalled();
  expect(history.location.pathname).toBe('/home');

  global.fetch = oldFetch;
});

test('[React-Frontpage] Test Register', async () => {
  const history = createMemoryHistory();
  const renderApp = () => {
    render(
      <Router history={history}>
        <NetlifyIdentityContext url="https://orbital-2021-pekoland.netlify.app">
          <FrontPageView />
        </NetlifyIdentityContext>
      </Router>,
      container,
    );
  };

  history.push('/login/register');
  act(renderApp);
  expect(container.textContent).toContain('Tell Me About Yourself');

  const emailInp = document.querySelector('input[type="email"]');
  const [pwdInp1, pwdInp2] = document.querySelectorAll('input[type="password"]');
  const ignInp = document.querySelector('input[type="text"]');

  const changeValues = (email, pwd1, pwd2, ign) => () => {
    emailInp.value = email;
    pwdInp1.value = pwd1;
    pwdInp2.value = pwd2;
    ignInp.value = ign;
    Simulate.change(emailInp);
    Simulate.change(pwdInp1);
    Simulate.change(pwdInp2);
    Simulate.change(ignInp);
  };

  expect(document.querySelector('button[type="submit"]').disabled).toBe(true);

  // Invalid Email
  act(changeValues('invalidemail', 'pwd', 'pwd', 'a'));
  expect(document.querySelector('button[type="submit"]').disabled).toBe(true);

  // Mismatch Pass
  act(changeValues('email@email.com', 'pwd', 'pwd2', 'a'));
  expect(document.querySelector('button[type="submit"]').disabled).toBe(true);

  // Empty values
  act(changeValues('email@email.com', 'pwd', 'pwd', ''));
  expect(document.querySelector('button[type="submit"]').disabled).toBe(true);

  act(changeValues('email@email.com', 'pwd', '', 'a'));
  expect(document.querySelector('button[type="submit"]').disabled).toBe(true);

  act(changeValues('email@email.com', '', 'pwd', 'a'));
  expect(document.querySelector('button[type="submit"]').disabled).toBe(true);

  act(changeValues('', 'pwd', 'pwd', 'a'));
  expect(document.querySelector('button[type="submit"]').disabled).toBe(true);

  // Valid
  act(changeValues('email@email.com', 'pwd', 'pwd', 'a'));
  expect(document.querySelector('button[type="submit"]').disabled).toBe(false);

  const oldFetch = global.fetch;
  let fetchPromise;
  global.fetch = jest.fn();
  global.fetch.mockImplementationOnce(() => {
    fetchPromise = new Promise((resolve) => {
      resolve();
    });
    return fetchPromise;
  });

  act(() => {
    Simulate.click(document.querySelector('button[type="submit"]'));
  });

  await fetchPromise;
  expect(global.fetch).toHaveBeenCalled();

  global.fetch = oldFetch;
});

test('[React-Frontpage] Test Forget Password', async () => {
  const history = createMemoryHistory();
  const renderApp = () => {
    render(
      <Router history={history}>
        <NetlifyIdentityContext url="https://orbital-2021-pekoland.netlify.app">
          <FrontPageView />
        </NetlifyIdentityContext>
      </Router>,
      container,
    );
  };

  history.push('/login/forget');
  act(renderApp);
  expect(container.textContent).toContain('Forgotten Password');

  const emailInp = document.querySelector('input[type="email"]');

  const changeValues = (email) => () => {
    emailInp.value = email;
    Simulate.change(emailInp);
  };

  expect(document.querySelector('button[type="submit"]').disabled).toBe(true);

  // Invalid Email
  act(changeValues('invalidemail'));
  expect(document.querySelector('button[type="submit"]').disabled).toBe(true);

  act(changeValues('email@email.com'));
  expect(document.querySelector('button[type="submit"]').disabled).toBe(false);

  const oldFetch = global.fetch;
  let fetchPromise;
  global.fetch = jest.fn();
  global.fetch.mockImplementationOnce(() => {
    fetchPromise = new Promise((resolve) => {
      resolve();
    });
    return fetchPromise;
  });

  act(() => {
    Simulate.click(document.querySelector('button[type="submit"]'));
  });

  await fetchPromise;
  expect(global.fetch).toHaveBeenCalled();

  global.fetch = oldFetch;
});
