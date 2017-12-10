'use strict';
const Joi = require('joi');

module.exports = function validateRequest(toValidate = {}, options, handler) {
    return function (req, res, next) {
        try {
            for (let key of Object.keys(toValidate)) {
                const { error, value } = Joi.validate(
                    (req[key] || {}), toValidate[key], options[key]
                );
                if (error) {
                    error.isRequestValidation = true;
                    if (!handler) return next(error);
                    return handler(error, req, res, next);
                }
                req[key] = value;
            };
            return next();
        } catch (err) {
            if (!handler) return next(err);
            return handler(err, req, res, next);
        }
    };
};
