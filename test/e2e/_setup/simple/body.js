const router = require('express').Router();
const Joi = require('joi');
const { RequestValidation } = require('../../../../lib');
const data = require('../data');

const validate = new RequestValidation({
    base: {
        body: Joi.object().keys({
            some: Joi.string().required(),
            other: Joi.number().required()
        })
    },
    unbuilt: {
        body: {
            some: Joi.string().required(),
            other: Joi.number().required()
        }
    },
    mutates: {
        body: Joi.object().keys({
            some: Joi.number().options({ convert: true }),
            other: Joi.string().default('a default string')
        })
    }
});

router.post('/base', validate.base, data);
router.post('/unbuilt', validate.unbuilt, data);
router.post('/mutates', validate.mutates, data);
module.exports = router;
