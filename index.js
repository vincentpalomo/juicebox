require('dotenv').config();

const express = require('express');
const server = express();

const { client } = require('./db');
client.connect();

const PORT = 3000;

const morgan = require('morgan');
server.use(morgan('dev'));
server.use(express.json());

const apiRouter = require('./api');
server.use('/api', apiRouter);

server.use((req, res, next) => {
  console.log('<____Body Logger START____>');
  console.log(req.body);
  console.log('<_____Body Logger END_____>');

  next();
});

server.get('/api', (req, res, next) => {
  console.log('A get request was made to /api');
  res.send({ message: 'success' });
});

server.post('/api', (req, res, next) => {
  console.log('A request was made to /api');
  next();
});

server.listen(PORT, () => {
  console.log(`The server is running on: http://localhost:${PORT}`);
});
