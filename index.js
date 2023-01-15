const express = require('express');
const server = express();

const PORT = 3000;

server.use((req, res, next) => {
  console.log('<____Body Logger START____>');
  console.log(req.body);
  console.log('<_____Body Logger END_____>');

  next();
});

app.get('/api', (req, res, next) => {
  console.log('A get request was made to /api');
  res.send({ message: 'success' });
});

app.post('/api', (req, res, next) => {
  console.log('A request was made to /api');
  next();
});

server.listen(PORT, () => {
  console.log(`The server is running on: http://localhost:${PORT}`);
});
