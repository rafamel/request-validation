'use strict';
const Joi = require('joi');
const config = require('./config');

module.exports = {
    schema(obj) {
        const error = Error(`Failed to validate schema. Please check the ${config.moduleName} documentation.`);
        Joi.assert(
            obj,
            Joi.object().pattern(config.reqRegexp.all, Joi.object()).required(),
            error
        );
        const helper = (inObj) => {
            if (inObj.isJoi) return;
            Joi.assert(inObj, Joi.object().required(), error);
            const keys = Object.keys(inObj);
            if (!keys.length) throw error;
            keys.forEach(key => {
                helper(inObj[key]);
            });
        };
        helper(obj);
    },
    routes(routes) {
        const error = Error(`Failed to validate routes. Please check the ${config.moduleName} documentation.`);
        Joi.assert(routes, Joi.object().required(), error);
        Object.keys(routes).forEach(key => {
            let constructor;
            try { constructor = routes[key].constructor; } catch (e) {}
            if (constructor && constructor.name === 'ValidationSchema') {
                return;
            }
            try { this.schema(routes[key]); } catch (e) { throw error; }
        });
    },
    options(obj) {
        const error = Error(`Failed to validate options. Please check the ${config.moduleName} documentation.`);
        Joi.assert(
            obj,
            Joi.object().pattern(
                config.reqRegexp.defaults,
                Joi.object()
            ).required(),
            error
        );
    },
    presence(obj) {
        const error = Error(`Failed to validate .presence() arguments. Please check the ${config.moduleName} documentation.`);
        const str = Joi.string().valid('required', 'optional', 'forbidden');
        Joi.assert(
            obj,
            Joi.alternatives().try(
                str,
                Joi.object().pattern(config.reqRegexp.defaults, str)
            ).required(),
            error
        );
    }
};
