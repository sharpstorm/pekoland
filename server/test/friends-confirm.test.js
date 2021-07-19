import { expect, test, jest } from '@jest/globals';

const faunadb = require('faunadb');
const fetch = require('node-fetch');

jest.mock('faunadb');
jest.mock('node-fetch');

const { handler } = require('../functions/friends-confirm');

test('[Functions-Server friends-confirm] Test Rejection', async () => {
  const context = { clientContext: { identity: {}, user: {} } };

  // Not Logged In
  let resp = await handler({
    httpMethod: 'POST',
  }, { clientContext: { identity: {} } });
  expect(resp.statusCode).toBe(401);

  // Banned Check
  resp = await handler({
    httpMethod: 'POST',
  }, { clientContext: { identity: {}, user: { app_metadata: { roles: ['banned'] } } } });
  expect(resp.statusCode).toBe(401);

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

test('[Functions-Server friends-confirm] Test Logic', async () => {
  const context = {
    clientContext: {
      identity: {},
      user: {
        email: 'test2@email.com',
      },
    },
  };
  const query = jest.fn();
  faunadb.Client.mockImplementation(() => ({
    query,
  }));

  // Invalid User
  fetch.mockImplementationOnce(async () => ({
    json: () => ({ users: [] }),
  }));
  let resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      email: 'test@email.com',
      accept: true,
    }),
  }, context);
  expect(resp.statusCode).toBe(404);

  // Invalid User
  query.mockImplementationOnce(async () => ({
    data: [],
  }));
  fetch.mockImplementationOnce(async () => ({
    json: () => ({ users: [{ email: 'test@email.com' }] }),
  }));
  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      email: 'test@email.com',
      accept: true,
    }),
  }, context);
  expect(resp.statusCode).toBe(404);

  // No Friend list
  query.mockImplementationOnce(async () => ({
    data: [
      {
        data: { friends: undefined },
      },
    ],
  }));
  fetch.mockImplementationOnce(async () => ({
    json: () => ({ users: [{ email: 'test@email.com' }] }),
  }));
  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      email: 'test@email.com',
      accept: true,
    }),
  }, context);
  expect(resp.statusCode).toBe(404);

  // Accept, other user not found
  query.mockImplementationOnce(async () => ({
    data: [
      {
        data: {
          friends: [
            { email: 'test@email.com', waiting: 1 },
          ],
        },
      },
    ],
  })).mockImplementationOnce(async () => ({
    data: [],
  }));
  fetch.mockImplementationOnce(async () => ({
    json: () => ({ users: [{ email: 'test@email.com' }] }),
  }));
  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      email: 'test@email.com',
      accept: true,
    }),
  }, context);
  expect(resp.statusCode).toBe(404);

  // Accept
  const update = jest.fn();
  query.mockImplementationOnce(async () => ({
    data: [
      {
        data: {
          friends: [
            { email: 'test@email.com', waiting: 1 },
          ],
        },
      },
    ],
  })).mockImplementationOnce(async () => ({
    data: [
      {
        data: {
          friends: [],
        },
      },
    ],
  })).mockImplementationOnce(update).mockImplementationOnce(update);
  fetch.mockImplementationOnce(async () => ({
    json: () => ({ users: [{ email: 'test@email.com' }] }),
  }));
  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      email: 'test@email.com',
      accept: true,
    }),
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(update).toHaveBeenCalledTimes(2);
  expect(faunadb.query.Update).toHaveBeenCalledTimes(2);

  // reject
  update.mockClear();
  faunadb.query.Update.mockClear();
  query.mockImplementationOnce(async () => ({
    data: [
      {
        data: {
          friends: [
            { email: 'test@email.com', waiting: 1 },
          ],
        },
      },
    ],
  })).mockImplementationOnce(update);
  fetch.mockImplementationOnce(async () => ({
    json: () => ({ users: [{ email: 'test@email.com' }] }),
  }));
  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      email: 'test@email.com',
      accept: false,
    }),
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(update).toHaveBeenCalledTimes(1);
  expect(faunadb.query.Update).toHaveBeenCalledTimes(1);
});
