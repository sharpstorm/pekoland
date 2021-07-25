const faunadb = require('faunadb');

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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Bad Request' }),
    };
  }

  if (user.app_metadata && user.app_metadata.roles && user.app_metadata.roles.includes('banned')) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' }),
    };
  }

  // Validate OK
  const client = new faunadb.Client({
    secret: process.env.FAUNADB_SECRET,
  });

  try {
    // IGN or Email
    const ret = await client.query(q.Paginate(q.Match(q.Index('mail_by_to'), user.email.toLowerCase())));

    return {
      statusCode: 200,
      body: JSON.stringify({
        mailBlock: ret,
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
