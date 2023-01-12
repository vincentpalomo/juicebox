const { client, getAllUsers, createUser } = require('./index');

// function should call a query which drops all tables from our db
async function dropTables() {
  try {
    console.log(`Dropping tables...`);

    await client.query(`
    DROP TABLE users
    `);

    console.log(`Finished dropping tables...`);
  } catch (err) {
    console.error(err, `Error dropping tables!`);
  }
}

// function should call a query which creates all tables for our db
async function createTables() {
  try {
    console.log(`Creating tables...`);

    await client.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    );
    `);

    console.log(`Finished creating tables...`);
  } catch (err) {
    console.error(err, `Error building tables!`);
  }
}

// function should attempt to create a few users
async function createInitialUsers() {
  try {
    console.log(`Starting to create users...`);

    const albert = await createUser({
      username: 'albert',
      password: 'bertie99',
    });

    const sandra = await createUser({
      username: 'sandra',
      password: '2sandy4me',
    });

    const glamgal = await createUser({
      username: 'glamgal',
      password: 'soglam',
    });

    console.log(albert);
    console.log(sandra);
    console.log(glamgal);

    console.log(`Finished creating users...`);
  } catch (err) {
    console.error(err, `Error creating users!`);
  }
}

// function should call a query which rebuilds the db
async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
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
