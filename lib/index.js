'use strict';
const Joi = require('joi');
const merge = require('lodash.merge');
const config = require('./config');
const validateRequest = require('./validate-request');
const ValidationSchema = require('./validation-schema');

function buildOptions(obj = {}) {
    Joi.assert(
        obj,
        Joi.object().pattern(
            /(default|headers|body|query|params|cookies)/,
            Joi.object()
        ),
        Error(`Error parsing .options(). Please check the documentation for ${ config.moduleName }`)
    );
    const defaults = obj.hasOwnProperty('default')
        ? merge({}, config.options, obj.default)
        : config.options;
    config.req.forEach(x => {
        options[x] = (obj.hasOwnProperty(x))
            ? merge({}, defaults, obj[x])
            : defaults;
    });
    return options;
};

let handler;
const options = {};
buildOptions();

exports = module.exports = function ValidationRequest(obj = {}) {
    Joi.attempt(
        obj,
        Joi.object().keys({
            schema: Joi.object().pattern(/.*/, Joi.object().schema()),
            routes: Joi.alternatives().try(Joi.func(), Joi.object()),
            options: Joi.object()
        }),
        Error(`Error parsing object. Please check the documentation for ${ config.moduleName }`)
    );

    const ans = {};
    if (obj.schema) ans.schema = new ValidationSchema(obj.schema);

    if (obj.routes) {
        const routes = (typeof obj.routes === 'function')
            ? obj.routes(obj.schema)
            : obj.routes;
        Joi.attempt(
            routes,
            Joi.object().pattern(/.*/,
                Joi.object().pattern(
                    /(headers|body|query|params|cookies)/,
                    Joi.object().schema()
                )
            ),
            Error(`Error parsing 'routes'. Please check the documentation for ${ config.moduleName }`)
        );

        if (routes.hasOwnProperty('schema')) {
            throw Error(`${ config.moduleName } cannot receive a key 'schema' as a route`);
        }
        Object.keys(routes).forEach(key => {
            ans[key] = validateRequest(routes[key]);
        });
    }

    return ans;
};

exports.options = buildOptions;

exports.handler = function (handle) {
    handler = handle;
};

exports.ValidationSchema = ValidationSchema;
