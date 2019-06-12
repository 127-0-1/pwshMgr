require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const api = require('./server/routes/api');
const app = express();
const nodemailer = require("nodemailer");
const io = require('socket.io').listen(app.listen(process.env.PORT || 8080));
const bcrypt = require("bcryptjs");
const User = require('./server/models/user');


bcrypt.hash(process.env.ADMINPW, 10)
  .then(hash => {
    const user = new User({
      email: "admin@admin.admin",
      password: hash
    });
    user.save()
      .then(user => {
        console.log('created new user')
      })
      .catch(error => {
        console.log("user already created")
      });
  });

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

app.use(express.static(__dirname + '/dist'));

app.get('*', function (req, res) {
  res.sendfile('./dist/index.html')
});

module.exports = app;