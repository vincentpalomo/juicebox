const express = require('express');
const apiRouter = express.Router();

const userRouter = require('./users');
const postRouter = require('./posts');
const tagRouter = require('./tags');

// json web token
const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');
const { JWT_SECRET } = process.env;

// Checking Authorization
apiRouter.use(async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.header('Authorization');

  if (!auth) {
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);
    console.log(token);

    try {
      const { id } = jwt.verify(token, JWT_SECRET);
      console.log('id:', id);
      if (id) {
        req.user = await getUserById(id);
        console.log('user:', req.user);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: 'AuthorizationHeaderError',
      message: `Authorization token must start with ${prefix}`,
    });
  }
});

// logging set user
apiRouter.use((req, res, next) => {
  if (req.user) {
    console.log('User is set:', req.user);
  }
  next();
});

// attach routers
apiRouter.use('/users', userRouter);
apiRouter.use('/posts', postRouter);
apiRouter.use('/tags', tagRouter);

// error handler
apiRouter.use((error, req, res, next) => {
  res.send({
    name: error.name,
    message: error.message,
  });
});

module.exports = apiRouter;
