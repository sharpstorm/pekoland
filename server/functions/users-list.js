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

  // This is an administrator only route
  if (!user.app_metadata.roles || user.app_metadata.roles.length === 0
    || !user.app_metadata.roles.includes('admin')) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' }),
    };
  }

  if (event.httpMethod !== 'POST') {
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
    const obj = users
      .map((x) => ({
        email: x.email.toLowerCase(),
        id: x.id,
        isAdmin: (x.app_metadata.roles && x.app_metadata.roles.includes('admin')),
        banned: (x.app_metadata.roles && x.app_metadata.roles.includes('banned')),
        ign: x.user_metadata.ign,
      }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        users: obj,
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
