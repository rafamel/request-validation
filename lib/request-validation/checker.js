'use strict';
const Joi = require('joi');
const config = require('../config');
const { options } = require('../checker');
const ValidationSchema = require('../validation-schema');

module.exports = {
    options,
    routes(routes) {
        const error = Error(`Failed to validate routes. Please check the ${config.moduleName} documentation.`);
        if (!routes) throw error;
        Joi.assert(routes, Joi.object().pattern(
            /.*/,
            Joi.alternatives().try(
                Joi.object().type(ValidationSchema.constructor),
                Joi.object().pattern(
                    config.reqRegexp.all,
                    Joi.object()
                )
            )
        ), error);
        const helper = (inRoutes) => {
            if (inRoutes.isJoi) return;
            Joi.assert(inRoutes, Joi.object(), error);
            if (inRoutes instanceof ValidationSchema) throw error;
            Object.keys(inRoutes).forEach(key => { helper(inRoutes[key]); });
        };
        Object.keys(routes).forEach(key => {
            if (routes[key] instanceof ValidationSchema) return;
            helper(routes[key]);
        });
    }
};
