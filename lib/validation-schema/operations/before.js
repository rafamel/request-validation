'use strict';
const { parseInput } = require('./parse-input');

function use(args) {
    const tree = parseInput(args);
    return function (schema, current) {
        const helper = (inTree, inSchema, inCurrent) => {
            Object.keys(inTree).forEach(key => {
                if (!inSchema.hasOwnProperty(key)) {
                    throw Error('Some used key didn\'t exist for ValidationSchema.use()');
                }

                if (Object.keys(inTree[key]).length) {
                    if (!inCurrent.hasOwnProperty(key)) inCurrent[key] = {};
                    helper(inTree[key], inSchema[key], inCurrent[key]);
                } else {
                    inCurrent[key] = inSchema[key];
                }
            });
        };
        helper(tree, schema, current);
    };
}

function skip(args) {
    const tree = parseInput(args);
    return function (schema, current) {
        const helper = (inTree, inSchema, inCurrent) => {
            Object.keys(inTree).forEach(key => {
                if (!inCurrent.hasOwnProperty(key)) {
                    throw Error('Some skipped key didn\'t exist for ValidationSchema.skip()');
                }

                if (Object.keys(inTree[key]).length) {
                    helper(inTree[key], inSchema[key], inCurrent[key]);
                } else {
                    if (inCurrent.hasOwnProperty(key)) delete inCurrent[key];
                }
            });
        };
        helper(tree, schema, current);
    };
}

function add(addSchema, safe) {
    return function (_, current) {
        const helper = (inAddSchema, inCurrent) => {
            Object.keys(inAddSchema).forEach(key => {
                if (inAddSchema[key].isJoi) {
                    if (safe && inCurrent.hasOwnProperty(key)) {
                        throw Error('Add failed as some validation for a key already existed for ValidationSchema.safeAdd()');
                    }
                    inCurrent[key] = inAddSchema[key];
                } else if (!inCurrent.hasOwnProperty(key)) {
                    inCurrent[key] = inAddSchema[key];
                } else helper(inAddSchema[key], inCurrent[key]);
            });
        };
        helper(addSchema, current);
    };
}

function concat(concatSchema, safe) {
    return function (_, current) {
        const helper = (inConcatSchema, inCurrent) => {
            Object.keys(inConcatSchema).forEach(key => {
                if (!inCurrent.hasOwnProperty(key)) {
                    if (safe) {
                        throw Error('Concat failed as some key didn\'t exist for ValidationSchema.safeConcat()');
                    }
                    inCurrent[key] = inConcatSchema[key];
                } else if (inConcatSchema[key].isJoi) {
                    if (!inCurrent[key].isJoi) {
                        throw Error('Some concatenation failed as a schema key wasn\'t a Joi object for ValidationSchema.concat()');
                    }
                    inCurrent[key] = inCurrent[key].concat(inConcatSchema[key]);
                } else helper(inConcatSchema[key], inCurrent[key]);
            });
        };
        helper(concatSchema, current);
    };
}

module.exports = {
    use,
    skip,
    add,
    safeAdd(addSchema) { return add(addSchema, true); },
    concat,
    safeConcat(concatSchema) { return concat(concatSchema, true); }
};
