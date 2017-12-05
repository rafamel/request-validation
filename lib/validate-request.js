'use strict';
const Joi = require('joi');
const config = require('./config');
const ValidationSchema = require('./validation-schema');

module.exports = function validateRequest(toValidate = {}) {
    return async function (req, res, next) {
        try {
            for (let key of config.req) {
                if (toValidate.hasOwnProperty(key)) {
                    let schema = toValidate[key];
                    if (schema instanceof ValidationSchema) schema = schema.joi();
                    else if (!schema.isJoi) {
                        throw Error('Non schema or Joi object was provided for some key.');
                    }
                    const { error, value } = Joi.validate(
                        req[key], schema, config.joi
                    );
                    if (error) return next(error);
                    req[key] = value;
                }
            };
            return next();
        } catch (err) { return next(err); }
    };
};
