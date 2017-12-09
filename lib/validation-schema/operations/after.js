'use strict';
const { toEachStrings } = require('./parse-input');

function setPresence(args, presence) {
    const toSet = toEachStrings(args);
    return function (schema) {
        Object.keys(toSet).forEach(key => {
            if (!schema.hasOwnProperty(key)) {
                throw Error(`Key ${key} doesn't exist for ValidationSchema ${presence}`);
            }
            schema[key] = schema[key][presence](toSet[key]);
        });
    };
}

module.exports = {
    required(args) { return setPresence(args, 'requiredKeys'); },
    optional(args) { return setPresence(args, 'optionalKeys'); },
    forbidden(args) { return setPresence(args, 'forbiddenKeys'); }
};
