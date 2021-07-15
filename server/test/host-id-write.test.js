import { expect, test, jest } from '@jest/globals';

const faunadb = require('faunadb');

jest.mock('faunadb');

const { handler } = require('../functions/host-id-write');

test('[Functions-Server host-id-write] Test Rejection', async () => {
  const context = { clientContext: { identity: {}, user: {} } };

  // Not Logged In
  let resp = await handler({
    httpMethod: 'POST',
  }, { clientContext: { identity: {} } });
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

test('[Functions-Server host-id-write] Test Logic', async () => {
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

  // Create Record
  const creation = jest.fn();
  query.mockImplementationOnce(async () => ({
    data: [],
  })).mockImplementationOnce(creation);

  let resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      peer_id: 'hello',
    }),
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(creation).toHaveBeenCalled();
  expect(faunadb.query.Create).toHaveBeenCalled();

  // Update Record
  const update = jest.fn();
  query.mockImplementationOnce(async () => ({
    data: [['abcd', {}]],
  })).mockImplementationOnce(update);

  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      peer_id: 'hello',
    }),
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(update).toHaveBeenCalled();
  expect(faunadb.query.Update).toHaveBeenCalled();
});
