'use strict';
const merge = require('lodash.merge');
const validateRequest = require('./validate-request');
const ValidationSchema = require('../validation-schema');
const buildOptions = require('./build-options');
const checker = require('../checker');

let handler;
let options = buildOptions();

class RequestValidation {
    constructor(routes, opts) {
        checker.routes(routes);

        // Build (merge) options
        opts = (opts)
            ? merge({}, options, buildOptions(opts, {}))
            : options;

        // Build middleware
        Object.keys(routes).forEach(key => {
            const schema = (routes[key] instanceof ValidationSchema)
                ? routes[key].schema
                : (new ValidationSchema(routes[key])).schema;
            this[key] = validateRequest(schema, opts, handler);
        });
    }
}

module.exports = {
    RequestValidation,
    options(obj) {
        options = buildOptions(obj);
        return options;
    },
    handler(handle) {
        handler = handle;
    }
};
