const express = require('express');
const postRouter = express.Router();

const { getAllPosts, createPost, getPostById, updatePost } = require('../db');
const { requireUser } = require('./utils');

// post logger
postRouter.use((req, res, next) => {
  console.log('A request is being made to /posts');

  next();
});

// Create post with requireUser
postRouter.post('/', requireUser, async (req, res, next) => {
  const { title, content, tags = '' } = req.body;

  const tagArr = tags.trim().split(/\s+/);
  const postData = {};

  if (tagArr.length) {
    postData.tags = tagArr;
  }

  try {
    postData.title = title;
    postData.content = content;
    postData.authorId = req.user.id;

    const post = await createPost(postData);

    if (post) {
      res.send({
        post,
      });
    }
  } catch ({ name, username }) {
    next({ name, username });
  }
});

// Update post with requireUser
postRouter.patch('/:postId', requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost });
    } else {
      next({
        name: 'UnauthorizedUserError',
        message: 'You cannot update a post that is not yours',
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// get all posts
postRouter.get('/', async (req, res) => {
  const posts = await getAllPosts();

  res.send({
    posts,
  });
});

module.exports = postRouter;
