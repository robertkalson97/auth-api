const express = require('express');
const passport = require('passport');
const router = express.Router();

// Require needed controllers
const auth = require('../controllers/authController');

// POST request to create user
router.post('/signup', auth.auth_signup);

// POST request to authenticate user
router.post('/signin', auth.auth_signin);

// GET request to check uniqueness of a field
router.get('/unique/:key/:value', auth.auth_unique);

// GET request to confirm token validation
router.get('/', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  res.status(200).end('Authorized');
});

module.exports = router;
