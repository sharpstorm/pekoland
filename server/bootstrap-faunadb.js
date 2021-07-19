/* eslint-disable no-use-before-define */
/* eslint-disable import/no-extraneous-dependencies */

/* bootstrap database in your FaunaDB account */
const readline = require('readline');
const faunadb = require('faunadb');
const chalk = require('chalk');
require('dotenv').config();

const insideNetlify = insideNetlifyBuildContext();
const q = faunadb.query;

console.log(chalk.cyan('Creating your FaunaDB Database...\n'));

// 1. Check for required enviroment variables
if (!process.env.FAUNADB_SECRET) {
  console.log(chalk.yellow('Required FAUNADB_SECRET enviroment variable not found.'));
  if (insideNetlify) {
    console.log('Visit https://app.netlify.com/sites/YOUR_SITE_HERE/settings/deploys');
    console.log('and set a `FAUNADB_SECRET` value in the "Build environment variables" section');
    process.exit(1);
  }
  // Local machine warning
  if (!insideNetlify) {
    console.log();
    console.log('You can create fauna DB keys here: https://dashboard.fauna.com/db/keys');
    console.log();
    ask(chalk.bold('Enter your faunaDB server key'), (err, answer) => {
      if (!answer) {
        console.log('Please supply a faunaDB server key');
        process.exit(1);
      }
      createFaunaDB(process.env.FAUNADB_SECRET).then(() => {
        console.log('Database created');
      });
    });
  }
}

// Has var. Do the thing
if (process.env.FAUNADB_SECRET) {
  createFaunaDB(process.env.FAUNADB_SECRET).then(() => {
    console.log('Database created');
  });
}

/* idempotent operation */
function createFaunaDB(key) {
  console.log('Create the database!');
  const client = new faunadb.Client({
    secret: key,
  });

  /* Based on your requirements, change the schema here */
  return client.query(q.CreateCollection({ name: 'users' }))
    .then(() => client.query(q.CreateIndex({
      name: 'users_to_peer_id',
      source: q.Collection('users'),
      terms: [{ field: ['data', 'email'] }],
      values: [
        { field: ['data', 'peer_id'] },
        { field: ['ref'] },
      ],
    })))
    .then(() => client.query(q.CreateIndex({
      name: 'users_to_ref',
      source: q.Collection('users'),
      terms: [{ field: ['data', 'email'] }],
      values: [
        { field: ['ref'] },
      ],
    })))
    .then(() => client.query(q.CreateCollection({ name: 'mails' })))
    .then(() => client.query(q.CreateIndex({
      name: 'mail_by_to',
      source: q.Collection('mails'),
      terms: [{ field: ['data', 'to'] }],
      values: [
        { field: ['data', 'from'] },
        { field: ['data', 'to'] },
        { field: ['data', 'subject'] },
        { field: ['data', 'content'] },
        { field: ['ref'] },
      ],
    })))
    .then(() => client.query(q.CreateIndex({
      name: 'mail_by_from',
      source: q.Collection('mails'),
      terms: [{ field: ['data', 'from'] }],
      values: [
        { field: ['data', 'from'] },
        { field: ['data', 'to'] },
        { field: ['data', 'subject'] },
        { field: ['data', 'content'] },
        { field: ['ref'] },
      ],
    })))
    .then(() => client.query(q.CreateCollection({ name: 'reports' })))
    .then(() => client.query(q.CreateIndex({
      name: 'reports_by_time',
      source: q.Collection('reports'),
      values: [
        { field: ['data', 'timestamp'] },
        { field: ['data', 'type'] },
        { field: ['data', 'description'] },
        { field: ['ref'] },
      ],
    })))
    .then(() => client.query(q.CreateIndex({
      name: 'reports_by_user',
      source: q.Collection('reports'),
      terms: [{ field: ['data', 'submitted_by'] }],
      values: [
        { field: ['data', 'timestamp'] },
        { field: ['data', 'type'] },
        { field: ['data', 'description'] },
        { field: ['ref'] },
      ],
    })))
    .then(() => client.query(q.CreateCollection({ name: 'userfurniture' })))
    .then(() => client.query(q.CreateIndex({
      name: 'users_to_furniture',
      source: q.Collection('userfurniture'),
      terms: [{ field: ['data', 'email'] }],
    })))
    .catch((e) => {
      // Database already exists
      if (e.requestResult.statusCode === 400 && e.message === 'instance not unique') {
        console.log('DB already exists');
        throw e;
      } else {
        console.log(e);
      }
    });
}

/* util methods */

// Test if inside netlify build context
function insideNetlifyBuildContext() {
  if (process.env.DEPLOY_PRIME_URL) {
    return true;
  }
  return false;
}

// Readline util
function ask(question, callback) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question(`${question}\n`, (answer) => {
    rl.close();
    callback(null, answer);
  });
}
