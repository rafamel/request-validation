'use strict';
const clone = require('lodash.clone');
const cloneDeep = require('lodash.clonedeep');
const operations = require('./operations');

module.exports = function addOperations(symbol) {
    function addMethod(cb) {
        // Clone current object
        const cloned = clone(this);
        // Deep clone operations, to prevent mutation
        cloned[symbol.operations] = cloneDeep(this[symbol.operations]);
        // Call callback
        cb.call(cloned);
        // Return cloned object
        return cloned;
    }
    function addOp(beforeAfter, op, args, cb) {
        // Don't perform any activity if input (standardKeyPath) is empty
        if (!args
            || (Array.isArray(args) && !args.length)
            || (typeof args === 'object' && !Object.keys(args).length)
        ) {
            return this;
        }
        // Call addMethod and push operation to the end of operations array
        return addMethod.call(this, function () {
            this[symbol.operations][beforeAfter].push(operations[beforeAfter][op](args));
            if (cb) cb.call(this);
        });
    }
    return {
        before(...args) { return addOp.call(this, 'before', ...args); },
        after(...args) { return addOp.call(this, 'after', ...args); }
    };
};
