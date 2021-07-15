import { expect, test, jest } from '@jest/globals';

const fetch = require('node-fetch');
const { handler } = require('../functions/users-ign-change');

jest.mock('node-fetch');

test('[Functions-Server users-ign-change] Test Rejection', async () => {
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

  // No Body
  resp = await handler({
    httpMethod: 'POST',
  }, context);
  expect(resp.statusCode).toBe(400);

  // Invalid Body
  resp = await handler({
    httpMethod: 'POST',
    body: 'hello',
  }, context);
  expect(resp.statusCode).toBe(400);

  // Missing Param
  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({}),
  }, context);
  expect(resp.statusCode).toBe(400);
});

test('[Functions-Server users-ign-change] Test Logic', async () => {
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

  // Invalid User
  fetch.mockImplementationOnce(async () => {
    throw new Error('404');
  });
  let resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      user_id: 'user1',
      ign: 'newname',
    }),
  }, context);
  expect(resp.statusCode).toBe(404);

  // Success
  fetch.mockImplementationOnce(async () => {});
  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      user_id: 'user1',
      ign: 'newname',
    }),
  }, context);
  expect(resp.statusCode).toBe(200);
});
