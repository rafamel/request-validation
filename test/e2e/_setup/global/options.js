const router = require('express').Router();
const Joi = require('joi');
const { RequestValidation } = require('../../../../src');
const data = require('../data');

const validate = new RequestValidation({
  options: {
    body: {
      some: Joi.any()
    },
    headers: {
      some: Joi.any()
    }
  }
});

router.post('/options', validate.options, data);
module.exports = router;
