import { expect, test, jest } from '@jest/globals';

const faunadb = require('faunadb');

jest.mock('faunadb');

const { handler } = require('../functions/report-get');

test('[Functions-Server report-get] Test Rejection', async () => {
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

test('[Functions-Server report-get] Test Logic', async () => {
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
  const query = jest.fn();
  faunadb.Client.mockImplementation(() => ({
    query,
  }));

  // Invalid Report
  query.mockImplementationOnce(async () => {
    throw new Error('404');
  });

  let resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      report_id: 'abcd',
    }),
  }, context);
  expect(resp.statusCode).toBe(404);

  // Report Found, but unauthorised
  query.mockImplementationOnce(async () => ({
    data: {
      submitted_by: 'email1',
      description: 'desc',
    },
  }));
  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      report_id: 'abcd',
    }),
  }, context);
  expect(resp.statusCode).toBe(401);

  // Report Found, Owner
  query.mockImplementationOnce(async () => ({
    data: {
      submitted_by: 'email2',
      description: 'desc',
    },
  }));
  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      report_id: 'abcd',
    }),
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(resp.body).toBe(JSON.stringify({
    report: {
      submitted_by: 'email2',
      description: 'desc',
      id: 'abcd',
    },
  }));

  // Change to Admin
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

  // Report Found
  query.mockImplementationOnce(async () => ({
    data: {
      submitted_by: 'email3',
      description: 'desc',
    },
  }));
  resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      report_id: 'abcd',
    }),
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(resp.body).toBe(JSON.stringify({
    report: {
      submitted_by: 'email3',
      description: 'desc',
      id: 'abcd',
    },
  }));
});
