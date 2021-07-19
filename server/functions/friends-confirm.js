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

  if (data.email === undefined || data.accept === undefined) {
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
    const usersUrl = `${identity.url}/admin/users`;
    const adminAuthHeader = `Bearer ${identity.token}`;
    const userList = await fetch(usersUrl, {
      method: 'GET',
      headers: { Authorization: adminAuthHeader },
    }).then((x) => x.json());
    const { users } = userList;

    if (users.find((x) => x.email.toLowerCase() === data.email.toLowerCase()) === undefined) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User Not Found' }),
      };
    }

    const userData = await fetchUser(user.email.toLowerCase());
    if (userData === undefined) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User Not Found' }),
      };
    }

    const { friends } = userData.data;

    if (friends === undefined || friends === null) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User Not Found' }),
      };
    }

    let update = false;
    let newFriendsList;
    if (data.accept) {
      newFriendsList = friends.map((x) => {
        if (x.email.toLowerCase() === data.email.toLowerCase()) {
          const newX = x;
          newX.waiting = 0;
          update = true;
          return newX;
        }
        return x;
      });
    } else {
      newFriendsList = friends.filter((x) => x.email.toLowerCase() !== data.email.toLowerCase());
      update = true;
    }

    if (update) {
      // Try to get other person
      if (data.accept) {
        const otherUser = await fetchUser(data.email.toLowerCase());
        if (otherUser === undefined) {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: 'User Not Found' }),
          };
        }

        const newOtherUserList = otherUser.data.friends;
        newOtherUserList.push({
          email: user.email.toLowerCase(),
          waiting: 0,
        });
        await client.query(q.Update(otherUser.ref, {
          data: {
            friends: newOtherUserList,
          },
        }));
      }

      // Do updates
      await client.query(q.Update(userData.ref, {
        data: {
          friends: newFriendsList,
        },
      }));
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
      body: JSON.stringify({ message: ex }),
    };
  }
};
