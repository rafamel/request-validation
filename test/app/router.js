'use strict';
const router = require('express').Router();

router.use('/simple', require('./routes/simple'));

module.exports = router;
