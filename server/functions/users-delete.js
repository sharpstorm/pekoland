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

  if (data.user_id === undefined || data.user_id === '') {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Bad Request' }),
    };
  }

  // Validate OK
  try {
    const usersUrl = `${identity.url}/admin/users/${data.user_id}`;
    const adminAuthHeader = `Bearer ${identity.token}`;
    let targetUser;
    try {
      targetUser = await fetch(usersUrl, {
        method: 'GET',
        headers: { Authorization: adminAuthHeader },
      }).then((x) => x.json());
    } catch {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not Found' }),
      };
    }
    if (targetUser.app_metadata
      && targetUser.app_metadata.roles
      && targetUser.app_metadata.roles.includes('admin')) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: 'Not allowed to delete an admin',
        }),
      };
    }
    await fetch(usersUrl, {
      method: 'DELETE',
      headers: { Authorization: adminAuthHeader },
    });
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `${data.user_id} Deleted`,
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
