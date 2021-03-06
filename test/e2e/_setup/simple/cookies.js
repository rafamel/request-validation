const router = require('express').Router();
const Joi = require('joi');
const { RequestValidation } = require('../../../../src');
const data = require('../data');

const validate = new RequestValidation({
  base: {
    cookies: Joi.object().keys({
      some: Joi.string().required(),
      other: Joi.string()
        .valid('4')
        .required()
    })
  },
  unbuilt: {
    cookies: {
      some: Joi.string().required(),
      other: Joi.string()
        .valid('4')
        .required()
    }
  },
  mutates: {
    cookies: Joi.object().keys({
      some: Joi.number().options({ convert: true }),
      other: Joi.string().default('a default string')
    })
  }
});

router.get('/base', validate.base, data);
router.get('/unbuilt', validate.unbuilt, data);
router.get('/mutates', validate.mutates, data);
module.exports = router;
