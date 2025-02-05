const express = require('express');
const logger = require('morgan');
const posts = require('./routes/posts');
const auth = require('./routes/auth');
const users = require('./routes/users');
const chat = require('./routes/chat');
socketEvents = require('./socketEvents');
const bodyParser = require('body-parser');
const mongoose = require('./config/database'); //database configuration
var jwt = require('jsonwebtoken');
const app = express();
app.set('secretKey', 'nodeRestApi'); // jwt secret token
// connection to mongodb
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', function (req, res) {
  res.json({ "tutorial": "Build REST API with node.js" });
});
// public route
app.use('/users', auth);
// private route
app.use('/chat', validateUser, chat);
app.use('/users', validateUser, users);
app.use('/posts', validateUser, posts);
app.get('/favicon.ico', function (req, res) {
  res.sendStatus(204);
});
function validateUser(req, res, next) {
  jwt.verify(req.headers['x-access-token'], req.app.get('secretKey'), function (err, decoded) {
    if (err) {
      res.json({ status: "error", message: err.message, data: null });
    } else {
      // add user id to request
      req.body.userId = decoded.id;
      next();
    }
  });

}
// express doesn't consider not found 404 as an error so we need to handle 404 explicitly
// handle 404 error
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// handle errors
app.use(function (err, req, res, next) {
  console.log(err);

  if (err.status === 404)
    res.status(404).json({ message: "Not found" });
  else
    res.status(500).json({ message: "Something looks wrong :( !!!" });
});
var server = app.listen(8000, function () {
  console.log('Node server listening on port 8000');
});

const io = require('socket.io').listen(server);

socketEvents(io);  