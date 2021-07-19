const faunadb = require('faunadb');

const q = faunadb.query;
const REPORT_TYPES = ['', 'Report User', 'Report Bug', 'Report Problem', 'Help Request'];

exports.handler = async function handle(event, context) {
  const { identity, user } = context.clientContext;

  // Validation Step
  if (!identity || !user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' }),
    };
  }

  if (user.app_metadata && user.app_metadata.roles && user.app_metadata.roles.includes('banned')) {
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

  if (data.issue_type === undefined || data.issue_description === undefined) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Bad Request' }),
    };
  }

  if (data.issue_type < 1 || data.issue_type >= REPORT_TYPES.length || data.issue_description === '') {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Bad Request' }),
    };
  }

  // Validate OK
  const client = new faunadb.Client({
    secret: process.env.FAUNADB_SECRET,
  });

  try {
    const doc = await client.query(q.Create(q.Collection('reports'), {
      data: {
        type: data.issue_type,
        description: data.issue_description,
        status: 0,
        submitted_by: user.email.toLowerCase(),
        timestamp: Date.now(),
        action: '',
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
