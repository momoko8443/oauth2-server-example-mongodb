const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const bluebird = require('bluebird');
const authRoutes = require('./routes');
const database = require('./database');
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
global.Promise = bluebird;

database.connect();

const app = express();

app.use(session({
  secret: 'serai-idm',
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    url: 'mongodb://127.0.0.1:27017/session', //数据库的地址  student是数据库名
    touchAfter: 24 * 3600 //time period in seconds
  })
}));
app.use(express.static('public'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

authRoutes(app);

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});


app.listen(8000, err => (err ? console.log('Error happened', err) : console.log('Server is up')));