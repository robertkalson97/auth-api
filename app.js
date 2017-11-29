const express    = require('express');
const cors       = require('cors');
const logger     = require('morgan');
const bodyParser = require('body-parser');
const app        = express();

// make .env usage global
require('dotenv').config();

// config express
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// setup api headers
app.all('/*', cors(), (req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

// setup api endpoints
app.use('/v1', require('./routes'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render error page
  res.status(err.status || 500).json({ status: err.status, message: res.locals.message });
})

module.exports = app
