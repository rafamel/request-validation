const router = require('express').Router();
const Joi = require('joi');
const RequestValidation = require('../../../lib');

// Create validation for routes
const myValidation = RequestValidation({
    routes: {
        base: {
            body: Joi.object().keys({
                some: Joi.string().required(),
                other: Joi.number().required()
            })
        }
    }
});

// Add validation middleware to each route
router.post('/base', myValidation.base);
// router.get('/mutates', myValidation.mutates);

module.exports = router;
