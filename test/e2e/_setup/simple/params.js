const router = require('express').Router();
const Joi = require('joi');
const { RequestValidation } = require('../../../../lib');
const data = require('../data');

const validate = new RequestValidation({
    base: {
        params: Joi.object().keys({
            some: Joi.string().valid('4').required()
        })
    },
    unbuilt: {
        params: {
            some: Joi.string().valid('4').required()
        }
    },
    mutates: {
        params: Joi.object().keys({
            some: Joi.number().options({ convert: true }),
            other: Joi.string().default('a default string')
        })
    }
});

router.get('/base/:some', validate.base, data);
router.get('/unbuilt/:some', validate.unbuilt, data);
router.get('/mutates/:some', validate.mutates, data);
module.exports = router;
