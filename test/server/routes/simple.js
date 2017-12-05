const router = require('express').Router();
const Joi = require('joi');
const RequestValidation = require('../../../lib');

// Create validation for routes
const myValidation = RequestValidation({
    routes: {
        doBody: {
            body: Joi.object().keys({
                some: Joi.string().required(),
                other: Joi.number().required()
            })
        }
    }
});

// Add validation middleware to each route
router.get('/body', (req, res, next) => {
    req.body.some = 'ddd';
    req.body.other = 4;
    next({});
}, myValidation.doBody);

module.exports = router;
