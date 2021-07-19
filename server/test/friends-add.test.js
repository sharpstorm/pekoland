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
  expect(JSON.parse(resp.body).pending).toBeTruthy();
  expect(creation).toHaveBeenCalled();
  expect(faunadb.query.Create).toHaveBeenCalled();

  // Set Array
  const update = jest.fn();
  query.mockImplementationOnce(async () => ({
    data: [{
      data: {
        friends: null,
      },
    }],
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
  expect(JSON.parse(resp.body).pending).toBeTruthy();
  expect(update).toHaveBeenCalled();
  expect(faunadb.query.Update).toHaveBeenCalled();

  // Update Array
  update.mockClear();
  faunadb.query.Update.mockClear();
  query.mockImplementationOnce(async () => ({
    data: [{
      data: {
        friends: [],
      },
    }],
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
  expect(JSON.parse(resp.body).pending).toBeTruthy();
  expect(update).toHaveBeenCalled();
  expect(faunadb.query.Update).toHaveBeenCalled();

  // Already a friend, no self record, no pending
  creation.mockClear();
  faunadb.query.Create.mockClear();
  query.mockImplementationOnce(async () => ({
    data: [{
      data: {
        friends: [
          { email: 'test2@email.com' },
        ],
      },
    }],
  })).mockImplementationOnce(async () => undefined).mockImplementationOnce(creation);
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
  expect(JSON.parse(resp.body).pending).toBeFalsy();
  expect(creation).toHaveBeenCalled();
  expect(faunadb.query.Create).toHaveBeenCalled();

  // Already a friend, no pending
  update.mockClear();
  faunadb.query.Update.mockClear();
  query.mockImplementationOnce(async () => ({
    data: [{
      data: {
        friends: [
          { email: 'test2@email.com' },
        ],
      },
    }],
  })).mockImplementationOnce(async () => ({
    data: [{
      data: {
        friends: [],
      },
    }],
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
  expect(JSON.parse(resp.body).pending).toBeFalsy();
  expect(update).toHaveBeenCalled();
  expect(faunadb.query.Update).toHaveBeenCalled();
});
