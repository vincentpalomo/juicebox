const { client, getAllUsers, createUser } = require('./index');

const testusers = {
  name: 'john',
  location: 'usa',
};

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
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      active BOOLEAN DEFAULT true
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
      name: 'albert',
      location: 'earth',
    });

    const sandra = await createUser({
      username: 'sandra',
      password: '2sandy4me',
      name: 'sandra',
      location: 'nowhere',
    });

    const glamgal = await createUser({
      username: 'glamgal',
      password: 'soglam',
      name: 'joshua',
      location: 'LA',
    });

    console.log(albert);
    console.log(sandra);
    console.log(glamgal);

    console.log(`Finished creating users...`);
  } catch (err) {
    console.error(err, `Error creating users!`);
  }
}

// function to update the user profile
async function updateUser(id, fields = {}) {
  // build the set string
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(', ');

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [user],
    } = await client.query(
      `
      UPDATE users
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `,
      Object.values(fields)
    );

    return user;
  } catch (error) {
    throw error;
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

    console.log(`Calling all users`);
    const users = await getAllUsers();
    console.log('Result', users);

    console.log(`Calling updateUser on users[0]`);
    const updateUserResult = await updateUser(users[0].id, {
      name: 'Newname Sogood',
      location: 'Lesterville, KY',
    });
    console.log(`Result:`, updateUserResult);

    console.log(`Finished database tests!`);
  } catch (err) {
    console.error(err, `Error testing database!`);
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
