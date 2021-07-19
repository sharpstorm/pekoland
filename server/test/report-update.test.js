import { expect, test, jest } from '@jest/globals';

const faunadb = require('faunadb');

jest.mock('faunadb');

const { handler } = require('../functions/report-update');

test('[Functions-Server report-update] Test Rejection', async () => {
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

test('[Functions-Server report-update] Test Logic', async () => {
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
  const query = jest.fn();
  faunadb.Client.mockImplementation(() => ({
    query,
  }));

  // Error
  query.mockImplementationOnce(async () => {
    throw new Error('404');
  });
  let resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      report_id: 'abcd',
      status: 1,
      action: 'some action',
    }),
  }, context);
  expect(resp.statusCode).toBe(404);

  // Update
  query.mockImplementationOnce(async () => ({
    data: 'some data',
  }));

  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      report_id: 'abcd',
      status: 1,
      action: 'some action',
    }),
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(faunadb.query.Update).toHaveBeenCalled();
  expect(JSON.parse(resp.body).report).toBe('some data');
});
