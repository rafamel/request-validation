const router = require('express').Router();
const Joi = require('joi');
const { RequestValidation } = require('../../../../src');
const data = require('../data');

const validate = new RequestValidation({
  base: {
    query: Joi.object().keys({
      some: Joi.string().required(),
      other: Joi.string()
        .valid('4')
        .required()
    })
  },
  unbuilt: {
    query: {
      some: Joi.string().required(),
      other: Joi.string()
        .valid('4')
        .required()
    }
  },
  mutates: {
    query: Joi.object().keys({
      some: Joi.number().options({ convert: true }),
      other: Joi.string().default('a default string')
    })
  }
});

router.get('/base', validate.base, data);
router.get('/unbuilt', validate.unbuilt, data);
router.get('/mutates', validate.mutates, data);
module.exports = router;
