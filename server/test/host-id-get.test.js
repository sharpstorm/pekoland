import { expect, test, jest } from '@jest/globals';

const faunadb = require('faunadb');

jest.mock('faunadb');

const { handler } = require('../functions/host-id-get');

test('[Functions-Server host-id-get] Test Rejection', async () => {
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

test('[Functions-Server host-id-get] Test Logic', async () => {
  const context = { clientContext: { identity: {}, user: {} } };
  const query = jest.fn();
  faunadb.Client.mockImplementation(() => ({
    query,
  }));

  // Invalid User
  query.mockImplementationOnce(async () => ({
    data: [],
  }));

  let resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      email: 'hello',
    }),
  }, context);
  expect(resp.statusCode).toBe(404);

  // User Found
  query.mockImplementationOnce(async () => ({
    data: [['abcd']],
  }));
  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      email: 'hello',
    }),
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(resp.body).toBe(JSON.stringify({
    email: 'hello',
    online: true,
    peer_id: 'abcd',
  }));
});
