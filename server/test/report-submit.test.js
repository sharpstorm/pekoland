import { expect, test, jest } from '@jest/globals';

const faunadb = require('faunadb');

jest.mock('faunadb');

const { handler } = require('../functions/report-submit');

test('[Functions-Server report-submit] Test Rejection', async () => {
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

test('[Functions-Server report-submit] Test Logic', async () => {
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

  // Create Report
  query.mockImplementationOnce(async () => ({
    ref: {
      id: 'abcd',
    },
  }));

  const resp = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({
      issue_type: 1,
      issue_description: 'problem',
    }),
  }, context);
  expect(resp.statusCode).toBe(200);

  const doc = JSON.parse(resp.body);
  expect(doc.id).toBe('abcd');
  expect(doc.type).toBe(1);
  expect(doc.description).toBe('problem');
});
