const passport = require('passport');
const jwt = require('jsonwebtoken');
const models = require('../models');
const config = require('../config');

require('../config/passport')(passport);

const dashboard = {
  index: (passport.authenticate('jwt', { session: false }), (req, res) => {
    const token = getToken(req.headers);

    if (!token) {
      return res.status(500).json({ success: false, message: "no token provided" });
    } else {
      const decoded = jwt.verify(token, config.secret);
      models.User.findOne({
        where: {
          name: decoded.data.name
        }
      }).then(user => {
        if (!user) {
          res.status(500).json({ success: false, message: "user not found" });
        } else {
          res.status(200).json({ success: true, message: `Hello ${user.name}!` });
        }
      }).catch(err => {
        throw new Error(err);
      });
    }
  })
};

getToken = (headers) => {
  if (headers && headers.authorization) {
    const parted = headers.authorization.split(' ');

    if (parted.length === 1) {
      return parted[0];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

module.exports = dashboard;
