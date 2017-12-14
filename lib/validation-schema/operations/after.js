'use strict';
const { stringPaths } = require('./parse-input');

function setJoiKeys(args, name, joiFn) {
    const toSet = stringPaths(args);
    return function (schema) {
        Object.keys(toSet).forEach(key => {
            if (!schema.hasOwnProperty(key)) {
                throw Error(`Key ${key} doesn't exist for ValidationSchema ${name}()`);
            }
            schema[key] = schema[key][joiFn](toSet[key]);
        });
    };
}

module.exports = {
    required(args) { return setJoiKeys(args, 'required', 'requiredKeys'); },
    optional(args) { return setJoiKeys(args, 'optional', 'optionalKeys'); },
    forbidden(args) { return setJoiKeys(args, 'forbidden', 'forbiddenKeys'); }
};
