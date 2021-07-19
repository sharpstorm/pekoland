import { expect, test, jest } from '@jest/globals';

const fetch = require('node-fetch');
const { handler } = require('../functions/users-list');

jest.mock('node-fetch');

test('[Functions-Server users-list] Test Rejection', async () => {
  let context = {
    clientContext: {
      identity: {},
      user: {
        email: 'email2',
        app_metadata: {
          roles: [],
        },
      },
    },
  };

  // Not Logged In
  let resp = await handler({
    httpMethod: 'POST',
  }, { clientContext: { identity: {} } });
  expect(resp.statusCode).toBe(401);

  // Not Admin
  resp = await handler({
    httpMethod: 'POST',
  }, context);
  expect(resp.statusCode).toBe(401);

  context = {
    clientContext: {
      identity: {},
      user: {
        email: 'email2',
        app_metadata: {
          roles: ['admin'],
        },
      },
    },
  };

  // Wrong Method
  resp = await handler({
    httpMethod: 'GET',
  }, context);
  expect(resp.statusCode).toBe(400);
});

test('[Functions-Server users-list] Test Logic', async () => {
  const context = {
    clientContext: {
      identity: {},
      user: {
        email: 'email2',
        app_metadata: {
          roles: ['admin'],
        },
      },
    },
  };

  // Success
  fetch.mockImplementationOnce(async () => ({
    json: () => ({
      users: [
        {
          id: 'u1',
          email: 'email1',
          app_metadata: { roles: [] },
          user_metadata: { ign: 'name1' },
        },
        {
          id: 'u2',
          email: 'email2',
          app_metadata: { roles: ['admin'] },
          user_metadata: { ign: 'name2' },
        },
      ],
    }),
  }));

  const resp = await handler({
    httpMethod: 'POST',
  }, context);
  expect(resp.statusCode).toBe(200);
  const obj = JSON.parse(resp.body);
  expect(obj.users.length).toBe(2);
  expect(obj.users[0].id).toBe('u1');
  expect(obj.users[0].email).toBe('email1');
  expect(obj.users[0].isAdmin).toBeFalsy();
  expect(obj.users[0].ign).toBe('name1');

  expect(obj.users[1].id).toBe('u2');
  expect(obj.users[1].email).toBe('email2');
  expect(obj.users[1].isAdmin).toBeTruthy();
  expect(obj.users[1].ign).toBe('name2');
});
