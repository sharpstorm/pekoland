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

  const fetchUser = async (email) => {
    try {
      const userData = await client.query(q.Map(q.Paginate(q.Match(q.Index('users_to_ref'), email.toLowerCase())), q.Lambda('user', q.Get(q.Var('user')))));
      if (userData.data.length === 0) {
        return undefined;
      }
      return userData.data[0];
    } catch {
      return undefined;
    }
  };

  try {
    const myData = await fetchUser(user.email.toLowerCase());
    if (myData !== undefined) {
      const { friends } = myData.data;

      if (friends !== undefined && friends !== null) {
        const newFriends = friends.filter((x) => x.email !== data.email.toLowerCase());
        if (friends.length !== newFriends.length) {
          await client.query(q.Update(myData.ref, {
            data: {
              friends: newFriends,
            },
          }));
        }
      }
    }

    const otherUser = await fetchUser(data.email.toLowerCase());
    if (otherUser !== undefined) {
      const { friends } = otherUser.data;

      if (friends !== undefined && friends !== null) {
        const newFriends = friends.filter((x) => x.email !== user.email.toLowerCase());
        if (friends.length !== newFriends.length) {
          await client.query(q.Update(otherUser.ref, {
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
