const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async function(event, context) {
  const { identity, user } = context.clientContext;

  // Validation Step
  if (!identity || !user) {
    return {
      statusCode: 401,
      body: JSON.stringify({message: 'Unauthorized'})
    };
  }

  if (event.httpMethod !== 'POST' || !event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({message: 'Bad Request'})
    };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({message: 'Bad Request'})
    };
  }

  if (!data.email || data.email === '') {
    return {
      statusCode: 400,
      body: JSON.stringify({message: 'Bad Request'})
    };
  }

  // Validate OK
  const client = new faunadb.Client({
    secret: process.env.FAUNADB_SECRET
  });

  try {
    let ret = await client.query(q.Paginate(q.Match(q.Index('users_to_peer_id'), data.email.toLowerCase())));
    if (ret.data.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({message: 'User Not Found'})
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify ({
        email: data.email.toLowerCase(), 
        online: !(ret.data[0][0] === ''),
        peer_id: ret.data[0][0]
      })
    };
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({message: 'Internal Error'})
    };
  }
}