'use strict';
const config = require('../config');

module.exports = function proxier(obj) {
    return new Proxy(obj, {
        get(target, property, args) {
            if (config.req.indexOf(property) !== -1
                && target.data[property] !== undefined) {
                return Joi.object().keys(target.data[property]);
            }
            if (typeof target[property] !== 'function') {
                return target[property];
            }
            return new Proxy(target[property], {
                get(inner, innerProperty, args) {
                    if (typeof inner !== 'function'
                        || config.req.indexOf(innerProperty) === -1) {
                        return inner[innerProperty];
                    }
                    return function (...args) {
                        let p;
                        if (!args.length || args[0] == undefined) {
                            p = innerProperty;
                        } else {
                            p = {};
                            p[innerProperty] = args;
                        }
                        return inner.call(target, p);
                    }
                }
            });
        }
    });
};
