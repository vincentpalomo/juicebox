const express = require('express');
const userRouter = express.Router();

const { getAllUsers } = require('../db');

userRouter.use((req, res, next) => {
  console.log('A request is being made to /users');

  next();
});

userRouter.get('/', async (req, res) => {
  const users = await getAllUsers();

  res.send({
    users,
  });
});

module.exports = userRouter;
