const faunadb = require('faunadb');
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

  if (data.email === undefined || data.nickname === undefined) {
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
    const targetObject = await client.query(q.Paginate(q.Match(q.Index('users_to_ref'), data.email.toLowerCase())));
    if (targetObject.data.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User Not Found' }),
      };
    }

    const myData = await client.query(q.Paginate(q.Match(q.Index('users_to_ref'), user.email.toLowerCase())));
    if (myData.data.length === 0) {
      const newUser = createUserStructure(user.email.toLowerCase());
      newUser.friends = [{
        email: data.email.toLowerCase(),
        nickname: data.nickname,
      }];

      await client.query(q.Create(q.Collection('users'), {
        data: newUser,
      }));
    } else {
      const ref = myData.data[0];
      const userData = await client.query(q.Get(ref));
      const { friends } = userData.data;

      if (friends === undefined || friends === null) {
        await client.query(q.Update(ref, {
          data: {
            friends: [{
              email: data.email.toLowerCase(),
              nickname: data.nickname,
            }],
          },
        }));
      } else {
        const existingObject = friends.filter((x) => x.email === data.email.toLowerCase());
        if (existingObject.length === 0) {
          // Not a friend, create record
          friends.push({
            email: data.email.toLowerCase(),
            nickname: data.nickname,
          });
          await client.query(q.Update(ref, {
            data: {
              friends,
            },
          }));
        } else {
          const obj = existingObject[0];
          if (obj.nickname !== data.nickname) {
            // Update Nickname
            obj.nickname = data.nickname;
            await client.query(q.Update(ref, {
              data: {
                friends,
              },
            }));
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
          nickname: data.nickname,
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