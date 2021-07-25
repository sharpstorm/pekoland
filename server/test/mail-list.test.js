import { expect, test, jest } from '@jest/globals';

const faunadb = require('faunadb');

jest.mock('faunadb');

const { handler } = require('../functions/mail-list');

test('[Functions-Server mail-list] Test Rejection', async () => {
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
});

test('[Functions-Server mail-list] Test Logic', async () => {
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

  // User Route
  query.mockImplementationOnce(async () => ({
    data: [['1111', '2222', 'aabbccdd', 'ddccbbaa']],
  }));

  const resp = await handler({
    httpMethod: 'POST',
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(faunadb.query.Index).toHaveBeenLastCalledWith('mail_by_to');
  const r1 = JSON.parse(resp.body).mailBlock.data;
  expect(r1).toBeDefined();
  expect(r1.length).toBe(1);
  expect(r1[0][0]).toBe('1111');
  expect(r1[0][1]).toBe('2222');
  expect(r1[0][2]).toBe('aabbccdd');
  expect(r1[0][3]).toBe('ddccbbaa');
});
