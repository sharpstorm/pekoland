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

  if (data.report_id === undefined) {
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
    let ret;
    try {
      ret = await client.query(q.Get(q.Ref(q.Collection('reports'), data.report_id)));
    } catch {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Not Found' }),
      };
    }
    if (ret !== undefined && ret.data !== undefined) {
      // Only administrator or report owner can delete
      if ((user.app_metadata.roles && user.app_metadata.roles.length > 0 && user.app_metadata.roles.includes('admin'))
        || ret.data.submitted_by === user.email.toLowerCase()) {
        await client.query(q.Delete(q.Ref(q.Collection('reports'), data.report_id)));
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Done',
          }),
        };
      }
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' }),
      };
    }
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Not Found' }),
    };
  } catch (ex) {
    console.log(ex);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Error' }),
    };
  }
};
