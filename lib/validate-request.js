'use strict';
const Joi = require('joi');
const config = require('./config');
const ValidationSchema = require('./validation-schema');

module.exports = function validateRequest(toValidate = {}, options) {
    return async function (req, res, next) {
        try {
            for (let key of config.req) { // chc create joi obj validation
                if (toValidate.hasOwnProperty(key)) {
                    let schema = toValidate[key];
                    // chc remove joi() from runtime; precompile
                    if (schema instanceof ValidationSchema) schema = schema.joi();
                    else if (!schema.isJoi) {
                        throw Error('Non schema or Joi object was provided for some key.');
                    }
                    const { error, value } = Joi.validate(
                        req[key], schema, options[key]
                    );
                    if (error) return next(error);
                    req[key] = value;
                }
            };
            return next();
        } catch (err) { return next(err); }
    };
};
