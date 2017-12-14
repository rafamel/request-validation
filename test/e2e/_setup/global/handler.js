const router = require('express').Router();
const Joi = require('joi');
const { RequestValidation } = require('../../../../lib');
const data = require('../data');

const validate = new RequestValidation({
    handler: {
        body: Joi.object().keys({
            some: Joi.any().required()
        })
    }
});

router.post('/handler', validate.handler, data);
module.exports = router;
