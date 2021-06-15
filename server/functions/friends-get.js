const fetch = require('node-fetch');
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

  // Validate OK
  const client = new faunadb.Client({
    secret: process.env.FAUNADB_SECRET,
  });

  try {
    const ret = await client.query(q.Paginate(q.Match(q.Index('users_to_ref'), user.email.toLowerCase())));
    if (ret.data.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User Not Found' }),
      };
    }

    const ref = ret.data[0];
    const userData = await client.query(q.Get(ref));

    let { friends } = userData.data;

    if (friends === undefined || friends === null) {
      friends = [];
    }

    const usersUrl = `${identity.url}/admin/users`;
    const adminAuthHeader = `Bearer ${identity.token}`;
    const userList = await fetch(usersUrl, {
      method: 'GET',
      headers: { Authorization: adminAuthHeader },
    }).then((x) => x.json());
    const { users } = userList;

    friends = friends.map((friend) => {
      const newFriend = friend;
      const obj = users.find((x) => x.email.toLowerCase() === friend.email.toLowerCase());
      newFriend.ign = obj.user_metadata.ign;
      return newFriend;
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        email: user.email.toLowerCase(),
        friends,
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
