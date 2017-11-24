const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const models = require('../models');
const config = require('../config');

require('../config/passport')(passport);

const auth = {
  authenticate: (req, res) => {
    models.User.findOne({
      where: {
        name: req.body.name
      }
    }).then(user => {
      if (!user) {
        return res.status(401).json({ success: false, message: "user not found" });
      } else {
        const checkPassword = bcrypt.compareSync(req.body.password, user.password);

        if (!checkPassword) {
          return res.status(401).json({ success: false, message: "wrong password" });
        }

        const token = jwt.sign({
          data: user
        }, config.secret, {
          expiresIn: '1m'
        });
        
        res.status(200).json({ success: true, message: "user authenticated", token: token });
      }
    }).catch(err => {
      throw new Error(err);
    });
  },
  register: (req, res, next) => {
    const username = req.body.name;
    const email = req.body.email;
    const password = bcrypt.hashSync(req.body.password, 12);

    // validate username
    req.checkBody('name')
      .isAlphanumeric()
      .withMessage('only letters and numbers')
      .trim();
    req.checkBody('name', 'username already exists').isUsernameAvailable();

    // validate email
    req.checkBody('email')
      .isEmail()
      .withMessage('must be an email')
      .trim()
      .normalizeEmail();
    req.checkBody('email', 'email already in use').isEmailAvailable();

    // create username / output errors
    req.asyncValidationErrors().then(() => {
      models.User.create({
        name: username,
        email: email,
        password: password
      }).then(() => {
        res.status(200).json({ success: true, message: "user registered" });
      });      
    }).catch(errors => {
      res.status(422).json({ success: false, errors: errors });
    });
  }
};

module.exports = auth;
