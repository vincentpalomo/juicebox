const { Client } = require('pg');

const client = new Client('postgres://localhost:5432/juicebox-dev');

// get all users
async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username, name, location, active
    FROM users;`
  );
  return rows;
}

// create user
async function createUser({ username, password, name, location }) {
  try {
    const { rows } = await client.query(
      `
    INSERT INTO users (username, password, name, location)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (username) DO NOTHING
    RETURNING *;
    `,
      [username, password, name, location]
    );
    return rows;
  } catch (err) {
    console.error(err);
  }
}

// update user
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

// get all posts
async function getAllPosts() {
  const { rows } = await client.query(
    `SELECT id
    FROM posts;`
  );
  return rows;
}

// create post
async function createPost({ authorId, title, content }) {
  try {
    const { rows } = await client.query(
      `
    INSERT INTO posts ("authorId", title, content)
    VALUES ($1, $2, $3)
    RETURNING *;
    `,
      [authorId, title, content]
    );
    return rows;
  } catch (err) {
    console.error(err);
  }
}

// update post
async function updatePost(id, fields = {}) {
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
      rows: [post],
    } = await client.query(
      `
      UPDATE posts
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `,
      Object.values(fields)
    );

    return post;
  } catch (error) {
    throw error;
  }
}

// get posts by user
async function getPostsByUser(userId) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM posts
      WHERE "authorId"=${userId};
    `);

    return rows;
  } catch (error) {
    throw error;
  }
}

// get user by id
async function getUserById(userId) {
  // first get the user (NOTE: Remember the query returns
  // (1) an object that contains
  // (2) a `rows` array that (in this case) will contain
  // (3) one object, which is our user.
  // if it doesn't exist (if there are no `rows` or `rows.length`), return null
  try {
    const { rows } = await client.query(
      `
      SELECT * FROM users
      WHERE id = ${userId}
    `
    );
    console.log('rows', rows);
    if (!rows || !rows.length) {
      return null;
    }
    const user = rows[0];
    delete user.password;
    const posts = await getPostsByUser(userId);
    user.posts = posts;
    return user;
  } catch (err) {
    console.error(err);
  }
  // if it does:
  // delete the 'password' key from the returned object
  // get their posts (use getPostsByUser)
  // then add the posts to the user object with key 'posts'
  // return the user object
}

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  getAllPosts,
  createPost,
  updatePost,
  getPostsByUser,
  getUserById,
};
