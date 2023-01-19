const express = require('express');
const userRouter = express.Router();
const {
  getAllUsers,
  getUserByUsername,
  createUser,
  getUserById,
  updateUser,
} = require('../db');
const { requireUser } = require('./utils');
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;

// logging request to /user
userRouter.use((req, res, next) => {
  console.log('A request is being made to /users');

  next();
});

// get all users
userRouter.get('/', async (req, res) => {
  const allUsers = await getAllUsers();

  const users = allUsers.filter((user) => {
    if (user.active) {
      return true;
    }
  });

  res.send({
    users,
  });
});

// login user
userRouter.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  // const token = jwt.sign({ username }, process.env.JWT_SECRET);

  if (!username || !password) {
    next({
      name: 'MissingCredentialsError',
      message: 'Please supply both a username and password',
    });
  }

  try {
    const user = await getUserByUsername(username);

    if (user && user.password == password) {
      const token = jwt.sign({ id: user.id, username }, JWT_SECRET, {
        expiresIn: '1w',
      });
      res.send({ message: "you're logged in!", token });
    } else {
      next({
        name: 'IncorrectCredentialsError',
        message: 'Username or password is incorrect',
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
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
      JWT_SECRET,
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

// delete user
userRouter.delete('/:userId', requireUser, async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await getUserById(userId);

    if (user && user.id === req.user.id) {
      const deletedUser = await updateUser(user.id, { active: false });
      res.send({ user: deletedUser });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = userRouter;
