const router = require('express').Router();
const Joi = require('joi');
const { RequestValidation } = require('../../../../lib');
const data = require('../data');

const validate = new RequestValidation({
    base: {
        headers: Joi.object().keys({
            some: Joi.string().required(),
            other: Joi.string().valid('4').required()
        })
    },
    unbuilt: {
        headers: {
            some: Joi.string().required(),
            other: Joi.string().valid('4').required()
        }
    },
    mutates: {
        headers: Joi.object().keys({
            some: Joi.number().options({ convert: true }),
            other: Joi.string().default('a default string')
        })
    }
});

router.get('/base', validate.base, data);
router.get('/unbuilt', validate.unbuilt, data);
router.get('/mutates', validate.mutates, data);
module.exports = router;
