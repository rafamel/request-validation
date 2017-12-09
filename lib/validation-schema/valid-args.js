'use strict';
const Joi = require('joi');
const config = require('../config');

function schema(obj) {
    const error = Error(`Failed to validate schema. Please check the ${config.moduleName} documentation.`);
    Joi.assert(
        obj,
        Joi.object().pattern(config.reqRegexp.all, Joi.object()),
        error
    );
    const helper = (inObj) => {
        if (inObj.isJoi) return;
        Joi.assert(inObj, Joi.object(), error);
        Object.keys(inObj).forEach(key => {
            helper(inObj[key]);
        });
    };
    helper(obj);
}

function options(obj) {
    Joi.assert(
        obj,
        Joi.object().pattern(
            config.reqRegexp.defaults,
            Joi.any()
        ),
        Error(`Failed to validate .options() arguments. Please check the ${config.moduleName} documentation.`)
    );
}

function presence(obj) {
    const str = Joi.string().valid('required', 'optional', 'forbidden');
    Joi.assert(
        obj,
        Joi.alternatives().try(
            str,
            Joi.object().pattern(config.reqRegexp.defaults, str)
        ),
        Error(`Failed to validate .presence() arguments. Please check the ${config.moduleName} documentation.`)
    );
}

module.exports = {
    schema,
    options,
    presence
};
