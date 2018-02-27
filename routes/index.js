const express = require('express');
const router = express.Router();

// GET request for index
router.get('/', (req, res, next) => {
  res.status(200).json({ msg: 'api ready' });
});

module.exports = router;
