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

  if (!data.peer_id) {
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
    let ret = await client.query(q.Paginate(q.Match(q.Index('users_to_peer_id'), user.email)));
    if (ret.data.length === 0) {
      let doc = await client.query(q.Create(q.Collection('users'), {
        data: {
          email: user.email,
          peer_id: data.peer_id
        }
      }));
    } else {
      let ref = ret.data[0][1];
      let doc = await client.query(q.Update(ref, {
        data: {
          peer_id: data.peer_id
        }
      }));
    }

    return {
      statusCode: 200,
      body: JSON.stringify ({
        email: user.email, 
        peer_id: data.peer_id
      })
    };
  } catch (ex) {
    console.log(ex);
    return {
      statusCode: 500,
      body: JSON.stringify({message: 'Internal Error'})
    };
  }
}