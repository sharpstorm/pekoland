import { expect, test, jest } from '@jest/globals';

const fetch = require('node-fetch');
const { handler } = require('../functions/users-ban');

jest.mock('node-fetch');

test('[Functions-Server users-ban] Test Rejection', async () => {
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

test('[Functions-Server users-ban] Test Logic', async () => {
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
      ban: true,
    }),
  }, context);
  expect(resp.statusCode).toBe(404);

  // Admin
  fetch.mockImplementationOnce(async () => ({
    json: () => ({
      app_metadata: {
        roles: ['admin'],
      },
    }),
  }));
  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      user_id: 'user1',
      ban: true,
    }),
  }, context);
  expect(resp.statusCode).toBe(401);

  // Ban currently banned
  fetch.mockReset();
  fetch.mockImplementationOnce(async () => ({
    json: () => ({
      app_metadata: {
        roles: ['banned'],
      },
    }),
  }));
  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      user_id: 'user1',
      ban: true,
    }),
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(fetch).toBeCalledTimes(1);

  // Ban currently unbanned
  fetch.mockReset();
  fetch.mockImplementationOnce(async () => ({
    json: () => ({
      app_metadata: {
        roles: [],
      },
    }),
  }));
  fetch.mockImplementationOnce(async (url, args) => {
    expect(JSON.parse(args.body).app_metadata.roles).toContain('banned');
  });
  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      user_id: 'user1',
      ban: true,
    }),
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(fetch).toBeCalledTimes(2);

  // Unban currently ubanned
  fetch.mockReset();
  fetch.mockImplementationOnce(async () => ({
    json: () => ({
      app_metadata: {
        roles: [],
      },
    }),
  }));
  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      user_id: 'user1',
      ban: false,
    }),
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(fetch).toBeCalledTimes(1);

  // Unban currently banned
  fetch.mockReset();
  fetch.mockImplementationOnce(async () => ({
    json: () => ({
      app_metadata: {
        roles: ['banned'],
      },
    }),
  }));
  fetch.mockImplementationOnce(async (url, args) => {
    expect(JSON.parse(args.body).app_metadata.roles.length).toBe(0);
  });
  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      user_id: 'user1',
      ban: false,
    }),
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(fetch).toBeCalledTimes(2);
});
