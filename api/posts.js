const express = require('express');
const postRouter = express.Router();

const { requireUser } = require('./utils');
const { getAllPosts } = require('../db');

postRouter.post('/', requireUser, async (req, res, next) => {
  res.send({ message: 'Under construction' });
});

postRouter.use((req, res, next) => {
  console.log('A request is being made to /posts');

  next();
});

postRouter.get('/', async (req, res) => {
  const posts = await getAllPosts();

  res.send({
    posts,
  });
});

module.exports = postRouter;
