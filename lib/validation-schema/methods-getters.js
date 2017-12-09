'use strict';
const config = require('../config');

// Add extra methods and getters to prototype
module.exports = function (proto) {
    // Add each method for headers, body, cookies... (config.req)
    Object.getOwnPropertyNames(proto).filter(key => {
        try {
            return typeof proto[key] === 'function'
                && key !== 'constructor'
                && key !== 'clear';
        } catch (e) { return false; }
    }).forEach(key => {
        config.req.forEach(reqKey => {
            const newMethod = key + reqKey[0].toUpperCase() + reqKey.slice(1);
            proto[newMethod] = function (...args) {
                let p;
                if (!args.length) p = reqKey;
                else {
                    p = {};
                    p[reqKey] = (args.length > 1) ? args : args[0];
                }
                return this[key](p);
            };
        });
    });

    // Define getter for each headers, body, cookies... (config.req)
    config.req.forEach(reqKey => {
        proto.__defineGetter__(reqKey, function () { return this.schema[reqKey]; });
    });
};
