const faunadb = require('faunadb');

const fetch = require('node-fetch');

const q = faunadb.query;

exports.handler = async function handle(event, context) {
  const { identity, user } = context.clientContext;

  // Validation Step
  if (!identity || !user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' }),
    };
  }

  if (event.httpMethod !== 'POST' || !event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Bad Request' }),
    };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Bad Request' }),
    };
  }

  /* if (data.issue_type === undefined || data.issue_description === undefined) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Bad Request' }),
    };
  } */

  // Validate OK
  const client = new faunadb.Client({
    secret: process.env.FAUNADB_SECRET,
  });

  try {
    const doc = await client.query(q.Create(q.Collection('mails'), {
      data: {
        from: data.from,
        to: data.to,
        subject: data.subject,
        content: data.content,
      },
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: doc.ref.id,
        type: data.issue_type,
        description: data.issue_description,
        timestamp: Date.now(),
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