const { Strategy, ExtractJwt } = require('passport-jwt');

const config = require('./config');
const Users = require('../models/Users');

module.exports = (passport) => {
  const opts = {};

  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = config.APP_KEY;

  passport.use(new Strategy(opts, async (payload, done) => {
    try {
      const user = await Users.query().findById(payload.data.id);
      return done(null, user);
    } catch (error) {
      done(error, false);
    }

    return done(null, false);
  }));
};
