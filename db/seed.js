const { client, getAllUsers } = require('./index');

async function testDB() {
  try {
    client.connect();
    // const { rows } = await client.query(`SELECT * FROM users`);
    const users = await getAllUsers();
    console.log(users);
  } catch (err) {
    console.error(err);
  } finally {
    client.end();
  }
}

async function dropTables() {
  try {
    await client.query(``);
  } catch (err) {
    console.error(err);
  }
}

testDB();
