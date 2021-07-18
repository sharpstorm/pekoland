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

  if (data.user_id === undefined || data.ban === undefined) {
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
          message: 'Not allowed to ban an admin',
        }),
      };
    }

    const banUrl = `${identity.url}/admin/users/${data.user_id}`;
    let newRoles;
    let update = false;
    if (targetUser.app_metadata && targetUser.app_metadata.roles) {
      newRoles = targetUser.app_metadata.roles;
    } else {
      newRoles = [];
    }
    if (!newRoles.includes('banned') && data.ban) {
      newRoles.push('banned');
      update = true;
    } else if (newRoles.includes('banned') && !data.ban) {
      const idx = newRoles.indexOf('banned');
      if (idx >= 0) {
        newRoles.splice(idx, 1);
        update = true;
      }
    }

    if (update) {
      try {
        await fetch(banUrl, {
          method: 'PUT',
          headers: { Authorization: adminAuthHeader },
          body: JSON.stringify({ app_metadata: { roles: newRoles } }),
        });
        return {
          statusCode: 200,
          body: JSON.stringify({
            id: data.user_id,
            email: user.email,
            banned: data.ban,
          }),
        };
      } catch {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'User not Found' }),
        };
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        id: data.user_id,
        email: user.email,
        banned: data.ban,
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
