import { expect, test, jest } from '@jest/globals';

const faunadb = require('faunadb');

jest.mock('faunadb');

const { handler } = require('../functions/report-list');

test('[Functions-Server report-list] Test Rejection', async () => {
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
});

test('[Functions-Server report-list] Test Logic', async () => {
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

  // User Route
  query.mockImplementationOnce(async () => ({
    data: [['1111', 1, 'aabbccdd', { id: 'abcd' }]],
  }));

  let resp = await handler({
    httpMethod: 'POST',
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(faunadb.query.Index).toHaveBeenLastCalledWith('reports_by_user');
  const r1 = JSON.parse(resp.body).reports;
  expect(r1).toBeDefined();
  expect(r1.length).toBe(1);
  expect(r1[0].timestamp).toBe('1111');
  expect(r1[0].type).toBe(1);
  expect(r1[0].description).toBe('aabbccdd');
  expect(r1[0].id).toBe('abcd');

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
    data: [['1111', 1, 'aabbccdd', { id: 'abcd' }]],
  }));

  resp = await handler({
    httpMethod: 'POST',
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(faunadb.query.Index).toHaveBeenLastCalledWith('reports_by_time');
  const r2 = JSON.parse(resp.body).reports;
  expect(r2).toBeDefined();
  expect(r2.length).toBe(1);
  expect(r2[0].timestamp).toBe('1111');
  expect(r2[0].type).toBe(1);
  expect(r2[0].description).toBe('aabbccdd');
  expect(r2[0].id).toBe('abcd');
});
