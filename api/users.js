const express = require('express');
const userRouter = express.Router();

const jwt = require('jsonwebtoken');

const { getAllUsers, getUserByUsername, createUser } = require('../db');

// logging request to /user
userRouter.use((req, res, next) => {
  console.log('A request is being made to /users');

  next();
});

// get all users
userRouter.get('/', async (req, res) => {
  const users = await getAllUsers();

  res.send({
    users,
  });
});

// login user
userRouter.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  const token = jwt.sign({ username }, process.env.JWT_SECRET);

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

// register user
userRouter.post('/register', async (req, res, next) => {
  const { username, password, name, location } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        name: 'UserExistsError',
        message: 'A user by that username already exists',
      });
    }

    const user = await createUser({
      username,
      password,
      name,
      location,
    });

    const token = jwt.sign(
      {
        id: user.id,
        username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1w',
      }
    );

    res.send({
      message: 'thank you for signing up',
      token,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = userRouter;
