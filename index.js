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

// test for patch 1
server.get('/background/:color', (req, res, next) => {
  res.send(`
  <body style="background: ${req.params.color};">
  <h1>Hello World!</h1>
  </body>
  `);
});

// test for patch 2
server.get('/add/:first/to/:second', (req, res, next) => {
  res.send(`
  <h1>${req.params.first} + ${req.params.second} = ${
    Number(req.params.first) + Number(req.params.second)
  }</h1>
  `);
});

// Router
server.use('/api', apiRouter);

// Connect to postgreSQL DB
client.connect();

// Listener
server.listen(PORT, () => {
  console.log(`The server is running on: http://localhost:${PORT}`);
});
