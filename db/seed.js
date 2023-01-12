const { create } = require('domain');
const { client, getAllUsers } = require('./index');

// async function testDB() {
//   try {
//     client.connect();
//     // const { rows } = await client.query(`SELECT * FROM users`);
//     const users = await getAllUsers();
//     console.log(users);
//   } catch (err) {
//     console.error(err);
//   } finally {
//     client.end();
//   }
// }

// function should call a query which drops all tables from our db
async function dropTables() {
  try {
    await client.query(`DELETE * FROM users`);
  } catch (err) {
    console.error(err);
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
    console.error(err);
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
  } finally {
    client.end();
  }
}

// testDB();
rebuildDB();
