const express = require('express');
const tagRouter = express.Router();
const { getPostsByTagName } = require('../db/index');

const { getAllTags } = require('../db');

tagRouter.use((req, res, next) => {
  console.log('A request is being made to /tags');

  next();
});

tagRouter.get('/', async (req, res) => {
  const tags = await getAllTags();

  res.send({
    tags,
  });
});

tagRouter.get('/:tagName/posts', async (req, res, next) => {
  const tagName = req.params.tagName;
  console.log('tagname:', tagName);

  try {
    const posts = await getPostsByTagName(tagName);
    res.send({ posts });
  } catch ({ name, message }) {
    next({ name, message });
  }
  // res.send({ tagName });
});
module.exports = tagRouter;
