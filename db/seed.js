const { create } = require('domain');
const { client, getAllUsers } = require('./index');

// function should call a query which drops all tables from our db
async function dropTables() {
  try {
    await client.query(`DELETE * FROM users`);
  } catch (err) {
    console.error(err, `Error dropping tables!`);
  }
}

// function should call a query which creates all tables for our db
async function createTables() {
  try {
    await client.query(`
    INSERT users (id, username, password) 
    VALUES ($1, $2, $3)
    RETURNING *`);
  } catch (err) {
    console.error(err, `Error building tables!`);
  }
}

// function should call a query which rebuilds the db
async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
  } catch (err) {
    console.error(err);
  }
}

async function testDB() {
  try {
    console.log(`Starting to test database...`);

    const users = await getAllUsers();
    console.log('getAllUsers', users);

    console.log(`Finished database tests!`);
  } catch (err) {
    console.error(err, `Error testing database!`);
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
