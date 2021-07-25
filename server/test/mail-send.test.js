import { expect, test, jest } from '@jest/globals';

const faunadb = require('faunadb');

jest.mock('faunadb');

const { handler } = require('../functions/mail-send');

test('[Functions-Server mail-send] Test Rejection', async () => {
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

  // Invalid Issue Type
  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      issue_type: 0,
    }),
  }, context);
  expect(resp.statusCode).toBe(400);

  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      issue_type: 10,
    }),
  }, context);
  expect(resp.statusCode).toBe(400);

  // Invalid Description
  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      description: '',
    }),
  }, context);
  expect(resp.statusCode).toBe(400);
});

test('[Functions-Server mail-submit] Test Logic', async () => {
  const context = {
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
  const query = jest.fn();
  faunadb.Client.mockImplementation(() => ({
    query,
  }));

  // Create Mail
  query.mockImplementationOnce(async () => ({
    ref: {
      id: 'abcd',
    },
  }));

  const resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      from: '111',
      to: '222',
      subject: 'abc',
      content: 'cba',
    }),
  }, context);
  expect(resp.statusCode).toBe(200);

  const doc = JSON.parse(resp.body);
  expect(doc.message).toBe('Done');
});
