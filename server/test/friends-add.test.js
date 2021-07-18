import { expect, test, jest } from '@jest/globals';

const faunadb = require('faunadb');
const fetch = require('node-fetch');

jest.mock('faunadb');
jest.mock('node-fetch');

const { handler } = require('../functions/friends-add');

test('[Functions-Server friends-add] Test Rejection', async () => {
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

test('[Functions-Server friends-add] Test Logic', async () => {
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

  // Invalid User
  fetch.mockImplementationOnce(async () => ({
    json: () => ({ users: [] }),
  }));
  let resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      email: 'test@email.com',
    }),
  }, context);
  expect(resp.statusCode).toBe(404);

  // Create Record
  const creation = jest.fn();
  query.mockImplementationOnce(async () => ({
    data: [],
  })).mockImplementationOnce(creation);
  fetch.mockImplementationOnce(async () => ({
    json: () => ({ users: [{ email: 'test@email.com' }] }),
  }));

  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      email: 'test@email.com',
    }),
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(creation).toHaveBeenCalled();
  expect(faunadb.query.Create).toHaveBeenCalled();

  // Update Array
  const update = jest.fn();
  query.mockImplementationOnce(async () => ({
    data: [{}],
  })).mockImplementationOnce(() => ({
    data: {
      friends: null,
    },
  })).mockImplementationOnce(update);
  fetch.mockImplementationOnce(async () => ({
    json: () => ({ users: [{ email: 'test@email.com' }] }),
  }));

  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      email: 'test@email.com',
    }),
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(update).toHaveBeenCalled();
  expect(faunadb.query.Update).toHaveBeenCalled();
});
