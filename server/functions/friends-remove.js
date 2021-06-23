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

  if (data.email === undefined) {
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
    const myData = await client.query(q.Paginate(q.Match(q.Index('users_to_ref'), user.email.toLowerCase())));
    if (myData.data.length > 0) {
      const ref = myData.data[0];
      const userData = await client.query(q.Get(ref));
      const { friends } = userData.data;

      if (friends !== undefined && friends !== null) {
        const newFriends = friends.filter((x) => x.email !== data.email.toLowerCase());
        if (friends.length !== newFriends.length) {
          await client.query(q.Update(ref, {
            data: {
              friends: newFriends,
            },
          }));
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        email: user.email.toLowerCase(),
        friend: {
          email: data.email,
        },
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
