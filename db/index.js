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
    const {
      rows: [user],
    } = await client.query(
      `
    INSERT INTO users (username, password, name, location)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (username) DO NOTHING
    RETURNING *;
    `,
      [username, password, name, location]
    );
    return user;
  } catch (error) {
    console.error(error);
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
  try {
    const { rows: postIds } = await client.query(`
      SELECT id
      FROM posts;
    `);

    const posts = await Promise.all(
      postIds.map((post) => getPostById(post.id))
    );

    return posts;
  } catch (error) {
    throw error;
  }
}

// create post
async function createPost({ authorId, title, content, tags = [] }) {
  try {
    const {
      rows: [post],
    } = await client.query(
      `
    INSERT INTO posts ("authorId", title, content)
    VALUES ($1, $2, $3)
    RETURNING *;
    `,
      [authorId, title, content]
    );

    const tagList = await createTags(tags);

    return await addTagsToPost(post.id, tagList);
  } catch (error) {
    console.error(error);
  }
}

// update post
async function updatePost(postId, fields = {}) {
  // read off the tags & remove that field
  const { tags } = fields; // might be undefined
  delete fields.tags;

  // build the set string
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(', ');

  // return early if this is called without fields
  // if (setString.length === 0) {
  //   return;
  // }

  try {
    // update any fields that need to be updated
    if (setString.length > 0) {
      await client.query(
        `
      UPDATE posts
      SET ${setString}
      WHERE id=${postId}
      RETURNING *;
      `,
        Object.values(fields)
      );
    }

    // return early if there's no tags to update
    if (tags === undefined) {
      return await getPostById(postId);
    }

    // make any new tags that need to be made
    const tagList = await createTags(tags);
    const tagListIdString = tagList.map((tag) => `${tag.id}`).join(', ');

    // delete any post_tags from the database which aren't in that tagList
    await client.query(
      `
    DELETE FROM post_tags
    WHERE "tagId"
    NOT IN (${tagListIdString})
    AND "postId"=$1;
    `,
      [postId]
    );

    // create post_tags as necessary
    await addTagsToPost(postId, tagList);

    return await getPostById(postId);
  } catch (error) {
    throw error;
  }
}

// get posts by user
async function getPostsByUser(userId) {
  try {
    const { rows: postIds } = await client.query(`
      SELECT id FROM posts
      WHERE "authorId"=${userId};
    `);

    const posts = await Promise.all(
      postIds.map((post) => getPostById(post.id))
    );
    return posts;
  } catch (error) {
    throw error;
  }
}

// get user by id
async function getUserById(userId) {
  try {
    const {
      rows: [user],
    } = await client.query(`
      SELECT id, username, name, location, active
      FROM users
      WHERE id = ${userId}
    `);
    console.log('user', user);
    if (!user || !user.length) {
      return null;
    }
    user.posts = await getPostsByUser(userId);
    return user;
  } catch (error) {
    console.error(error);
  }
}

// create tags
async function createTags(tagList) {
  if (tagList === 0) {
    return;
  }

  const { name } = tagList;

  const insertValues = tagList.map((_, index) => `$${index + 1}`).join('), (');
  const selectValues = tagList.map((_, index) => `$${index + 1}`).join(', ');

  try {
    await client.query(
      `
    INSERT INTO tags(name)
    VALUES (${insertValues})
    ON CONFLICT (name) DO NOTHING;
    `,
      tagList
    );

    const { rows } = await client.query(
      `
    SELECT * FROM tags
    WHERE name
    IN (${selectValues});
    `,
      tagList
    );
    return rows;
  } catch (error) {
    console.error(error);
  }
}

// create post tag
async function createPostTag(postId, tagId) {
  try {
    await client.query(
      `
    INSERT INTO post_tags("postId", "tagId")
    VALUES ($1, $2)
    ON CONFLICT ("postId", "tagId") DO NOTHING;
    `,
      [postId, tagId]
    );
  } catch (error) {
    console.error(error);
  }
}

// add tag to post
async function addTagsToPost(postId, tagList) {
  try {
    const createPostTagPromises = tagList.map((tag) =>
      createPostTag(postId, tag.id)
    );

    await Promise.all(createPostTagPromises);

    return await getPostById(postId);
  } catch (error) {
    console.error(error);
  }
}

// get post by id
async function getPostById(postId) {
  try {
    const {
      rows: [post],
    } = await client.query(
      `
    SELECT *
    FROM posts
    WHERE id=$1;
    `,
      [postId]
    );

    const { rows: tags } = await client.query(
      `
    SELECT tags.*
    FROM tags
    JOIN post_tags ON tags.id=post_tags."tagId"
    WHERE post_tags."postId"=$1;
    `,
      [postId]
    );

    const {
      rows: [author],
    } = await client.query(
      `
    SELECT id, username, name, location
    FROM users
    WHERE id=$1
    `,
      [post.authorId]
    );

    post.tags = tags;
    post.author = author;

    delete post.authorId;

    return post;
  } catch (error) {
    console.error(error);
  }
}

// get post by tag name
async function getPostsByTagName(tagName) {
  try {
    const { rows: postIds } = await client.query(
      `
      SELECT posts.id
      FROM posts
      JOIN post_tags ON posts.id=post_tags."postId"
      JOIN tags ON tags.id=post_tags."tagId"
      WHERE tags.name=$1;
    `,
      [tagName]
    );

    return await Promise.all(postIds.map((post) => getPostById(post.id)));
  } catch (error) {
    throw error;
  }
}

// get all tags
async function getAllTags() {
  const { rows } = await client.query(`
  SELECT * FROM tags;
  `);
  return rows;
}

// get user by username
async function getUserByUsername(username) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
    SELECT *
    FROM users
    WHERE username=$1
    `,
      [username]
    );

    return user;
  } catch (error) {
    throw error;
  }
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
  addTagsToPost,
  createTags,
  getPostsByTagName,
  getAllTags,
  getUserByUsername,
};
