require('dotenv').config();

const express = require('express');
const server = express();
const morgan = require('morgan');
const { client } = require('./db');
const apiRouter = require('./api');

const PORT = 3000;

// morgan middleware

server.use(morgan('dev'));
server.use(express.json());

// req.body logger
server.use((req, res, next) => {
  console.log('<____Body Logger START____>');
  console.log(req.body);
  console.log('<_____Body Logger END_____>');

  next();
});

// Router
server.use('/api', apiRouter);

// Connect to postgreSQL DB
client.connect();

// Listener
server.listen(PORT, () => {
  console.log(`The server is running on: http://localhost:${PORT}`);
});
