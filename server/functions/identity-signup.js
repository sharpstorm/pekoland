const faunadb = require('faunadb');
const { createUserStructure } = require('./util');

const q = faunadb.query;

exports.handler = async function handle(event) {
  const { email } = event.body.user;

  // Validate OK
  const client = new faunadb.Client({
    secret: process.env.FAUNADB_SECRET,
  });

  try {
    const newUser = createUserStructure(email);
    await client.query(q.Create(q.Collection('users'), {
      data: newUser,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        email,
      }),
    };
  } catch (ex) {
    console.log(ex);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Error' }),
    };
  }
};
