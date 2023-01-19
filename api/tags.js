const express = require('express');
const tagRouter = express.Router();
const { getPostsByTagName } = require('../db/index');

const { getAllTags } = require('../db');

// tags logger
tagRouter.use((req, res, next) => {
  console.log('A request is being made to /tags');

  next();
});

// get all tags
tagRouter.get('/', async (req, res) => {
  const tags = await getAllTags();

  res.send({
    tags,
  });
});

// get to route by tagname
tagRouter.get('/:tagName/posts', async (req, res, next) => {
  const tagName = req.params.tagName;

  try {
    const posts = await getPostsByTagName(tagName);
    res.send({ posts });
  } catch ({ name, message }) {
    next({ name, message });
  }
});
module.exports = tagRouter;
