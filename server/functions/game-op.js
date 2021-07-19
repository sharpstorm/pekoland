const faunadb = require('faunadb');

const q = faunadb.query;

async function fetchFurnitureList(email) {
  const client = new faunadb.Client({
    secret: process.env.FAUNADB_SECRET,
  });

  try {
    const ret = await client.query(q.Map(q.Paginate(q.Match(q.Index('users_to_furniture'), email.toLowerCase())), q.Lambda('user', q.Get(q.Var('user')))));
    if (ret.data.length === 0) {
      return undefined;
    }

    return ret.data[0];
  } catch (ex) {
    console.log(ex);
    return undefined;
  }
}
exports.fetchFurnitureList = async (email) => fetchFurnitureList(email);

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

  if (data.op === undefined) {
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
    let ret;
    if (data.op === 'furniture-get') {
      let furnitureData = await fetchFurnitureList(user.email);
      if (furnitureData !== undefined) {
        furnitureData = furnitureData.data.furniture;
      }
      ret = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'OK',
          data: furnitureData,
        }),
      };
    } else if (data.op === 'furniture-save') {
      const check = await client.query(q.Paginate(q.Match(q.Index('users_to_furniture'), user.email.toLowerCase())));
      console.log(check.data[0]);
      if (check.data.length === 0) {
        await client.query(q.Create(q.Collection('userfurniture'), {
          data: {
            email: user.email.toLowerCase(),
            furniture: data.data,
          },
        }));
      } else {
        await client.query(q.Update(check.data[0], {
          data: {
            furniture: data.data,
          },
        }));
      }
      ret = {
        statusCode: 200,
        body: JSON.stringify({ message: 'OK' }),
      };
    } else {
      ret = {
        statusCode: 400,
        body: JSON.stringify({ message: 'Bad Request' }),
      };
    }
    return ret;
  } catch (ex) {
    console.log(ex);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Error' }),
    };
  }
};
