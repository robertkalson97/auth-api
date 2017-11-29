const nodemailer = require('nodemailer');
const jwt        = require('jsonwebtoken');
const bcrypt     = require('bcrypt');
const models     = require('../models');
const mailer     = require('../config/mailer');

const auth = {
  signin: (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    models.User.findOne({
      where: {
        name: username
      }
    }).then(user => {
      if (!user) {
        return res.status(401).json({ success: false, message: "user doesn't exist" });
      } else {
        const checkPassword = bcrypt.compareSync(password, user.password);

        if (!checkPassword) {
          return res.status(401).json({ success: false, message: "wrong password" });
        }

        const payload = {
          name: user.name,
          email: user.email,
          activated: user.isActivated
        }

        const token = jwt.sign({
          data: payload
        }, process.env.APP_SECRET, {
          expiresIn: '1m'
        });

        res.status(200).json({ success: true, message: 'user authenticated', token: token });
      }
    }).catch(err => {
      throw new Error(err);
    });
  },
  signup: (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = bcrypt.hashSync(req.body.password, 10);

    // validate username
    req.checkBody('username')
       .isAlphanumeric()
       .withMessage('only letters and numbers')
       .trim();
    req.checkBody('username')
       .isUsernameAvailable()
       .withMessage('username already exists');

    // validate email
    req.checkBody('email')
       .isEmail()
       .withMessage('must be an email')
       .trim()
       .normalizeEmail();
    req.checkBody('email')
       .isEmailAvailable()
       .withMessage('email already in use');

    // create username / output errors
    req.asyncValidationErrors().then(() => {
      models.User.create({
        name: username,
        email: email,
        password: password
      }).then(result => {
        const userid = result.id;
        const email = result.email;
        const token = generateToken();

        // create activation token
        models.UserActivation.create({
          token: token,
          user_id: userid
        });

        // send activation mail
        mailer.sendMail({
          from: process.env.SMTP_USER,
          to: email,
          subject: 'Please activate your account',
          text: `Open this link in your browser, to activate your account: http://localhost:3000/v1/activate/${token}`
        }, (err, info) => {
          if (err) {
            return console.error(err);
          }

          console.info(`Activation Mail sent: ${info.messageId}`);
        });

        res.status(200).json({ success: true, message: "user registered" });
      });
    }).catch(err => {
      res.status(422).json({ success: false, errors: err });
    });
  },
  activate: (req, res, next) => {
    const token = req.params.token;

    models.UserActivation.findOne({
      where: {
        token: token
      }
    }).then(result => {
      if (!result) {
        res.status(500).json({ success: false, message: "token does not exist" });
      } else {
        models.User.update({
          isActivated: 1
        }, {
          where: {
            id: result.user_id
          }
        }).then(() => {
          res.status(200).json({ success: true, message: "user activated" });

          // delete used token
          models.UserActivation.destroy({
            where: {
              token: token
            }
          }).catch(err => {
            throw new Error(err);
          });
        }).catch(err => {
          throw new Error(err);
        });
      }
    })
  },
  verify: (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
      return res.status().json({ success: false, message: 'no token provided' });
    } else {
      jwt.verify(token, process.env.APP_SECRET, (err, decoded) => {
        if (err) {
          throw new Error(err);
        } else {
          res.status(200).json({ success: true, data: decoded.data });
        }
      })
    }
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
