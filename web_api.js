require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const api = require('./server/routes/api');
const app = express(); 
const io = require('socket.io').listen(app.listen(process.env.PORT || 8080));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

io.sockets.on('connection', function (socket) {
  socket.on('room', function (room) {
    socket.join(room)
  });
});

app.use(function (req, res, next) {
  req.io = io;
  next();
});

app.use('/api', api);

module.exports = app;