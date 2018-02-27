const dbConfig = require('./knexfile');
const Knex = require('knex');
const { Model } = require('objection');

const express = require('express');
const path = require('path');
const cors = require('cors');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');

const index = require('./routes/index');
const auth = require('./routes/auth');

// Initialize knex
const knex = Knex(dbConfig.development);

// Bind all Models to knex instance
Model.knex(knex);

// Initalize app
const app = express();

// App Middlewares
app.use(cors());
app.use(logger('dev'));
app.use(passport.initialize());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Bring in the passport strategy
require('./config/passport')(passport);

// Define Routes
app.use('/', index);
app.use('/auth', auth);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('NotFound');
  err.status = 404;
  next(err);
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ msg: err.message });
  console.error(err.stack);
});

module.exports = app;
