import { expect, test, jest } from '@jest/globals';

const faunadb = require('faunadb');
const fetch = require('node-fetch');

jest.mock('faunadb');
jest.mock('node-fetch');

const { handler } = require('../functions/friends-get');

test('[Functions-Server friends-get] Test Rejection', async () => {
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

test('[Functions-Server friends-get] Test Logic', async () => {
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

  // Empty Friends (Short Circuit)
  query.mockImplementationOnce(async () => ({
    data: [],
  }));
  let resp = await handler({
    httpMethod: 'POST',
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(JSON.parse(resp.body).friends).toBeDefined();
  expect(JSON.parse(resp.body).friends.length).toBe(0);

  // Undefined User List
  query.mockImplementationOnce(async () => ({
    data: [''],
  })).mockImplementationOnce(async () => ({
    data: {
      friends: null,
    },
  }));
  fetch.mockImplementationOnce(async () => ({
    json: () => ({ users: [{ email: 'test@email.com' }] }),
  }));

  resp = await handler({
    httpMethod: 'POST',
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(JSON.parse(resp.body).friends).toBeDefined();
  expect(JSON.parse(resp.body).friends.length).toBe(0);

  // Populated List
  query.mockImplementationOnce(async () => ({
    data: [''],
  })).mockImplementationOnce(async () => ({
    data: {
      friends: [{ email: 'email1' }, { email: 'email2' }],
    },
  }));
  fetch.mockImplementationOnce(async () => ({
    json: () => ({
      users: [
        { email: 'email1', user_metadata: { ign: 'user1' } },
        { email: 'email2', user_metadata: { ign: 'user2' } },
        { email: 'email3', user_metadata: { ign: 'user3' } },
      ],
    }),
  }));

  resp = await handler({
    httpMethod: 'POST',
  }, context);
  expect(resp.statusCode).toBe(200);
  expect(JSON.parse(resp.body).friends).toBeDefined();
  expect(JSON.parse(resp.body).friends.length).toBe(2);
  expect(JSON.parse(resp.body).friends[0].ign).toBe('user1');
  expect(JSON.parse(resp.body).friends[1].ign).toBe('user2');
});
