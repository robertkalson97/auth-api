const express = require('express');
const validator = require('express-validator');
const router = express.Router();

const auth = require('./auth');
const dashboard = require('./dashboard');

const models = require('../models');

/**
 * Make validator available on all routes
 */
router.use(validator({
  customValidators: {
    isUsernameAvailable(username) {
      return new Promise((resolve, reject) => {
        models.User.findOne({ where: { name: username } }).then(user => {
          if (user === null) {
            resolve();
          } else {
            reject();
          }
        }).catch(err => {
          throw err;
        });
      });
    },
    isEmailAvailable(email) {
      return new Promise((resolve, reject) => {
        models.User.findOne({ where: { email: email } }).then(user => {
          if (user === null) {
            resolve();
          } else {
            reject();
          }
        }).catch(err => {
          throw err;
        });
      });
    },
  }
}));

/**
 * Routes that can be accessed by everyone
 */
router.get('/', (req, res, next) => {
  res.status(200).json({ status: 200, message: "api ready" })
});
router.post('/login', auth.authenticate);
router.post('/register', auth.register);
router.get('/activate/:token', auth.activate);

/**
 * Routes that can be accessed by authenticated users
 */
router.get('/dashboard', dashboard.index);

module.exports = router;
