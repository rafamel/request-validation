'use strict';
const clone = require('lodash.clone');
const cloneDeep = require('lodash.clonedeep');
const operations = require('./operations');

module.exports = function (symbol) {
    function addMethod(cb) {
        const cloned = clone(this);
        cloned[symbol.operations] = cloneDeep(this[symbol.operations]);
        if (cb) cb.call(cloned);
        return cloned;
    }
    function addOp(beforeAfter, op, args, cb) {
        if (!args
            || (Array.isArray(args) && !args.length)
            || (typeof args === 'object' && !Object.keys(args).length)
        ) {
            return this;
        }

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
