const express = require('express');
const postRouter = express.Router();

const { getAllPosts } = require('../db');
const { requireUser } = require('./utils');

// post logger
postRouter.use((req, res, next) => {
  console.log('A request is being made to /posts');

  next();
});

// get all posts
postRouter.get('/', async (req, res) => {
  const posts = await getAllPosts();

  res.send({
    posts,
  });
});

// post with requireUser
postRouter.post('/', requireUser, async (req, res, next) => {
  res.send({ message: 'under construction' });
});

module.exports = postRouter;
