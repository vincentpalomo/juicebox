const express = require('express');
const userRouter = express.Router();

const jwt = require('jsonwebtoken');

const { getAllUsers, getUserByUsername } = require('../db');

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

userRouter.post('/login', async (req, res, next) => {
  const { id, username, password } = req.body;

  const token = jwt.sign({ id, username }, process.env.JWT_SECRET);

  if (!username || !password) {
    next({
      name: 'MissingCredentialsError',
      message: 'Please suppy both a username and password',
    });
  }

  try {
    const user = await getUserByUsername(username);

    if (user && user.password == password) {
      res.send({ message: "you're logged in!", token: token });
    } else {
      next({
        name: 'IncorrectCredentialsError',
        message: 'Username or password is incorrect',
      });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = userRouter;
