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

  if (data.user_id === undefined || data.ign === undefined) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Bad Request' }),
    };
  }

  // Validate OK
  try {
    const usersUrl = `${identity.url}/admin/users/${data.user_id}`;
    const adminAuthHeader = `Bearer ${identity.token}`;
    try {
      await fetch(usersUrl, {
        method: 'PUT',
        headers: { Authorization: adminAuthHeader },
        body: JSON.stringify({ user_metadata: { ign: data.ign } }),
      });
      return {
        statusCode: 200,
        body: JSON.stringify({
          id: data.user_id,
          email: user.email,
          ign: data.ign,
        }),
      };
    } catch {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not Found' }),
      };
    }
  } catch (ex) {
    console.log(ex);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Error' }),
    };
  }
};
