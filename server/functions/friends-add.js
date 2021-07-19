const faunadb = require('faunadb');
const fetch = require('node-fetch');
const { createUserStructure } = require('./util');

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

  if (data.email.toLowerCase() === user.email.toLowerCase()) {
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

    let pending = true;
    const otherUser = await fetchUser(data.email.toLowerCase());
    if (otherUser === undefined) {
      const newUser = createUserStructure(data.email.toLowerCase());
      newUser.friends = [{
        email: user.email.toLowerCase(),
        waiting: 1,
      }];

      await client.query(q.Create(q.Collection('users'), {
        data: newUser,
      }));
    } else {
      const { friends } = otherUser.data;

      if (friends === undefined || friends === null) {
        await client.query(q.Update(otherUser.ref, {
          data: {
            friends: [{
              email: user.email.toLowerCase(),
              waiting: 1,
            }],
          },
        }));
      } else {
        const existingObject = friends.filter((x) => x.email === user.email.toLowerCase());
        if (existingObject.length === 0) {
          // Not a friend, create record
          friends.push({
            email: user.email.toLowerCase(),
            waiting: 1,
          });
          await client.query(q.Update(otherUser.ref, {
            data: {
              friends,
            },
          }));
        } else if (!existingObject[0].waiting || existingObject.waiting === 0) {
          pending = false;
          const selfObj = await fetchUser(user.email.toLowerCase());
          if (selfObj === undefined) {
            const newUser = createUserStructure(user.email.toLowerCase());
            newUser.friends = [{
              email: data.email.toLowerCase(),
              waiting: 0,
            }];

            await client.query(q.Create(q.Collection('users'), {
              data: newUser,
            }));
          } else {
            const existing2 = selfObj.data.friends
              .filter((x) => x.email === data.email.toLowerCase());
            if (existing2.length === 0) {
              // Not a friend, create record
              const selfFriends = selfObj.data.friends;
              selfFriends.push({
                email: data.email.toLowerCase(),
                waiting: 0,
              });
              await client.query(q.Update(selfObj.ref, {
                data: {
                  friends: selfFriends,
                },
              }));
            }
          }
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
        pending,
      }),
    };
  } catch (ex) {
    console.log(ex);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: ex.toString() }),
    };
  }
};
