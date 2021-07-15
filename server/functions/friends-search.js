const fetch = require('node-fetch');

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
  try {
    const usersUrl = `${identity.url}/admin/users`;
    const adminAuthHeader = `Bearer ${identity.token}`;
    const userList = await fetch(usersUrl, {
      method: 'GET',
      headers: { Authorization: adminAuthHeader },
    }).then((x) => x.json());

    const { users } = userList;
    const obj = users.find((x) => x.email.toLowerCase() === data.email.toLowerCase());
    if (obj === undefined) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not Found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        email: obj.email,
        ign: obj.user_metadata.ign,
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
