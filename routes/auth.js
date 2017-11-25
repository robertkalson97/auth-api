const nodemailer = require('nodemailer');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const models = require('../models');

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
        }, process.env.APP_SECRET, {
          expiresIn: '1m'
        });
        
        res.status(200).json({ success: true, message: "user authenticated", token: token });
      }
    }).catch(err => {
      throw new Error(err);
    });
  },
  register: (req, res) => {
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
      }).then(result => {
        const token = generateToken();

        models.UserActivation.create({
          token: token,
          user_id: result.id
        });

        // TODO Globalize the nodemailer transport instance
        const transport = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        // send activation mail
        const mail = {
          from: process.env.SMTP_USER,
          to: result.email,
          subject: 'Please activate your account',
          text: `Open this link in your browser, to activate your account: http://localhost:3000/v1/activate/${token}`
        }

        transport.sendMail(mail, (error, info) => {
          if (error) {
            return console.error(error);
          }
          console.log('Activation Mail sent: %s', info.messageId);
        });

        res.status(200).json({ success: true, message: "user registered" });
      });
    }).catch(errors => {
      res.status(422).json({ success: false, errors: errors });
    });
  },
  activate: (req, res) => {
    const token = req.params.token;

    models.UserActivation.findOne({
      where: {
        token: token
      }
    }).then(result => {
      if (!result) {
        res.status(500).json({ success: false, message: "token does not exist" });
      } else {
        // set user to activated
        models.User.update({
          isActivated: 1
        }, {
          where: {
            id: result.user_id
          }
        }).then(() => {
          res.status(200).json({ success: true, message: "user has been activated" });
        });

        // delete the token
        models.UserActivation.destroy({
          where: {
            token: token
          }
        });
      }
    }).catch(err => {
      throw new Error(err);
    });
  }
};

// Helper to generate a random token
// https://gist.github.com/pilgreen/72be9f2964caa8030592
generateToken = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


module.exports = auth;
