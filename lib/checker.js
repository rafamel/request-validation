'use strict';
const Joi = require('joi');
const config = require('./config');

module.exports = {
    options(obj) {
        Joi.assert(
            obj,
            Joi.object().pattern(
                config.reqRegexp.defaults,
                Joi.any()
            ),
            Error(`Failed to validate options. Please check the ${config.moduleName} documentation.`)
        );
    }
};
