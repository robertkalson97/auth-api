const jwt = require('jsonwebtoken');

const config = require('../config/config');
const Users = require('../models/Users');

/**
 * Handle User signup request
 */
exports.auth_signup = async (req, res, next) => {
  const data = req.body;

  try {
    await Users.query().insert(data);
    res.status(200).json({ msg: 'user created' });
  } catch (error) {
    res.status(error.statusCode).json({ errors: error.data });
  }
}

/**
 * Handle User signin request
 */
exports.auth_signin = async (req, res, next) => {
  const data = req.body;
  const user = await Users.query().findOne({ email: data.email });

  // check user
  if (!user) {
    return res.status(401).json({ msg: `${data.email} doesn't exist` });
  } else {
    const passwordValid = await user.verifyPassword(data.password);

    // check password
    if (!passwordValid) {
      return res.status(401).json({ msg: 'wrong password' });
    }
  }

  // generate the token
  const token = jwt.sign({ data: user }, config.APP_KEY, { expiresIn: '1h' });
  res.status(200).json({ msg: 'authenticated', token: `Bearer ${token}` });
}

/**
 * Handles uniqueness check
 */
exports.auth_unique = async (req, res, next) => {
  const params = req.params;
  const user = await Users.query().where(params.key, params.value);

  if (user[0] !== undefined) {
    res.status(401).json(false);
  } else {
    res.status(200).json(true);
  }
}
