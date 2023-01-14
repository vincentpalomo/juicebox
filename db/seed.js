const {
  client,
  getAllUsers,
  createUser,
  updateUser,
  getAllPosts,
  updatePost,
  createPost,
  getUserById,
} = require('./index');

const testusers = {
  name: 'john',
  location: 'usa',
};

// function should call a query which drops all tables from our db
async function dropTables() {
  try {
    console.log(`Dropping tables...`);

    await client.query(`
    DROP TABLE IF EXISTS post_tags;
    DROP TABLE IF EXISTS tags;
    DROP TABLE IF EXISTS posts;
    DROP TABLE IF EXISTS users;
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
    CREATE TABLE posts (
      id SERIAL PRIMARY KEY,
      "authorId" INTEGER REFERENCES users(id) NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      active BOOLEAN DEFAULT true
    );
    CREATE TABLE tags (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL
    );
    CREATE TABLE post_tags (
      "postId" INTEGER REFERENCES posts(id),
      "tagId" INTEGER REFERENCES tags(id)
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

// function should attempt to create a few posts
async function createInitialPosts() {
  try {
    const [albert, sandra, glamgal] = await getAllUsers();

    await createPost({
      authorId: albert.id,
      title: 'First Post',
      content:
        'This is my first post. I hope I love writing blogs as much as I love writing them.',
    });

    await createPost({
      authorId: sandra.id,
      title: 'How does this work?',
      content: 'Seriously, does this even do anything?',
    });

    await createPost({
      authorId: glamgal.id,
      title: 'Living the Glam Life',
      content: 'Do you even? I swear that half of you are posing.',
    });

    // a couple more
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
    await createInitialPosts();
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

    console.log('Calling getAllPosts');
    const posts = await getAllPosts();
    console.log('Result:', posts);

    console.log('Calling updatePost on posts[0]');
    const updatePostResult = await updatePost(posts[0].id, {
      title: 'New Title',
      content: 'Updated Content',
    });
    console.log('Result:', updatePostResult);

    console.log('Calling getUserById with 1');
    const albert = await getUserById(1);
    console.log('Result:', albert);

    console.log(`Finished database tests!`);
  } catch (err) {
    console.error(err, `Error testing database!`);
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
