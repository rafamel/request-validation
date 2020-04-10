const router = require('express').Router();
const Joi = require('joi');
const { RequestValidation } = require('../../../../src');
const data = require('../data');

const validate = new RequestValidation({
  pre: {
    body: Joi.object().keys({
      some: Joi.any()
    })
  }
});

router.post('/options/pre', validate.pre, data);
module.exports = router;
