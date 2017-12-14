const router = require('express').Router();
const Joi = require('joi');
const { RequestValidation, ValidationSchema } = require('../../../../lib');
const data = require('../data');

const schema = new ValidationSchema({
    body: {
        username: Joi.string().min(2).max(10),
        password: Joi.string().min(6).max(20)
    },
    cookies: {
        aCookie: Joi.string().required(),
        bCookie: Joi.string()
    }
});

const validate = new RequestValidation({
    allOptional: schema
        .skip('cookies.aCookie')
        .presence('optional'),
    defaultOptional: schema.presence('optional'),
    inheritedDefaults: schema.use('cookies', 'body.username')
}, {
    cookies: { presence: 'optional' }
});

router.post('/allOptional', validate.allOptional, data);
router.post('/defaultsOptional', validate.defaultOptional, data);
router.post('/ineritedDefaults', validate.inheritedDefaults, data);
module.exports = router;
