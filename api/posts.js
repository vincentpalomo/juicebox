const express = require('express');
const postRouter = express.Router();

const { getAllPosts, createPost } = require('../db');
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

// get all posts
postRouter.get('/', async (req, res) => {
  const posts = await getAllPosts();

  res.send({
    posts,
  });
});

module.exports = postRouter;
