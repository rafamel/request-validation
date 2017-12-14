'use strict';
const router = require('express').Router();

router.use('/body', require('./body'));
router.use('/cookies', require('./cookies'));
router.use('/headers', require('./headers'));
router.use('/query', require('./query'));
router.use('/params', require('./params'));

module.exports = router;
