import { expect, test, jest } from '@jest/globals';

const fetch = require('node-fetch');
const { handler } = require('../functions/friends-search');

jest.mock('node-fetch');

test('[Functions-Server friends-search] Test Rejection', async () => {
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

test('[Functions-Server friends-search] Test Logic', async () => {
  const context = {
    clientContext: {
      identity: {},
      user: {
        email: 'test@email.com',
      },
    },
  };

  // Invalid User
  fetch.mockImplementationOnce(async () => ({
    json: () => ({ users: [] }),
  }));
  let resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      email: 'email1',
    }),
  }, context);
  expect(resp.statusCode).toBe(404);

  // Valid Search
  fetch.mockImplementationOnce(async () => ({
    json: () => ({ users: [{ email: 'email1', user_metadata: { ign: 'name1' } }] }),
  }));

  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      email: 'email1',
    }),
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(JSON.parse(resp.body).email).toBe('email1');
  expect(JSON.parse(resp.body).ign).toBe('name1');
});
