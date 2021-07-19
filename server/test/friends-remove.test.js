import { expect, test, jest } from '@jest/globals';

const faunadb = require('faunadb');

jest.mock('faunadb');

const { handler } = require('../functions/friends-remove');

test('[Functions-Server friends-remove] Test Rejection', async () => {
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

test('[Functions-Server friends-remove] Test Logic', async () => {
  const context = {
    clientContext: {
      identity: {},
      user: {
        email: 'test@email.com',
      },
    },
  };
  const query = jest.fn();
  faunadb.Client.mockImplementation(() => ({
    query,
  }));

  // User Friends List not yet created
  query.mockImplementationOnce(async () => ({ data: [] }));
  let resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      email: 'email3',
    }),
  }, context);
  expect(resp.statusCode).toBe(200);

  // Friend not in list
  const update = jest.fn();
  query.mockImplementationOnce(async () => ({
    data: [
      {
        data: {
          friends: [
            { email: 'email1' },
            { email: 'email2' },
          ],
        },
      },
    ],
  })).mockImplementationOnce(async () => ({
    data: [],
  }));

  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      email: 'email3',
    }),
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(faunadb.query.Update).not.toHaveBeenCalled();

  // Update Record
  faunadb.query.Update.mockClear();
  query.mockImplementationOnce(async () => ({
    data: [
      {
        data: {
          friends: [
            { email: 'email1' },
            { email: 'email2' },
          ],
        },
      },
    ],
  }))
    .mockImplementationOnce(update)
    .mockImplementationOnce(async () => ({
      data: [],
    }));

  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      email: 'email1',
    }),
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(update).toHaveBeenCalled();
  expect(faunadb.query.Update).toHaveBeenCalledTimes(1);

  // Update Other Only
  update.mockClear();
  faunadb.query.Update.mockClear();
  query.mockImplementationOnce(async () => ({
    data: [],
  }))
    .mockImplementationOnce(async () => ({
      data: [
        {
          data: {
            friends: [
              { email: 'test@email.com' },
              { email: 'email2' },
            ],
          },
        },
      ],
    }))
    .mockImplementationOnce(update);

  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      email: 'email1',
    }),
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(update).toHaveBeenCalled();
  expect(faunadb.query.Update).toHaveBeenCalledTimes(1);

  // Update Both
  update.mockClear();
  faunadb.query.Update.mockClear();
  query.mockImplementationOnce(async () => ({
    data: [
      {
        data: {
          friends: [
            { email: 'email1' },
            { email: 'email2' },
          ],
        },
      },
    ],
  }))
    .mockImplementationOnce(update)
    .mockImplementationOnce(async () => ({
      data: [
        {
          data: {
            friends: [
              { email: 'test@email.com' },
              { email: 'email2' },
            ],
          },
        },
      ],
    }))
    .mockImplementationOnce(update);

  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      email: 'email1',
    }),
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(update).toHaveBeenCalledTimes(2);
  expect(faunadb.query.Update).toHaveBeenCalledTimes(2);
});
