'use strict';
const Joi = require('joi');
const clone = require('lodash.clone');
const cloneDeep = require('lodash.clonedeep');
const operations = require('./operations');
const config = require('../config');

function addMethod(cb) {
    const vsClone = clone(this);
    vsClone[symbol.operations] = cloneDeep(this[symbol.operations]);
    if (cb) cb.call(vsClone);
    return vsClone;
}

const addOperation = (function () {
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
})();

const symbol = {
    operations: Symbol('operations'),
    schema: Symbol('schema'),
    use: Symbol('use')
};

class ValidationSchema {
    constructor(schema) {
        // todo validate schema
        this[symbol.schema] = schema;
        this[symbol.use] = false;
        this[symbol.operations] = {
            before: [],
            after: []
        };
    }

    set schema(schema) {
        // todo validate schema
        this[symbol.schema] = schema;
    }
    get schema() {
        const buildJoi = (schema) => {
            Object.keys(schema).forEach(key => {
                if (schema[key].isJoi) return;
                schema[key] = Joi.object().keys(schema[key]);
            });
            return schema;
        };
        const beforeOperations = (schema) => {
            const current = (this[symbol.use]) ? {} : schema;
            this[symbol.operations].before.forEach(operation => {
                operation(schema, current);
            });
            // Clean current
            const clean = (inCurrent) => {
                if (inCurrent.isJoi) return;
                Object.keys(inCurrent).forEach(key => {
                    if (Object.keys(inCurrent[key]).length) {
                        return clean(inCurrent[key]);
                    }
                    delete inCurrent[key];
                });
            };
            clean(current);
            return current;
        };
        const afterOperations = (schema) => {
            this[symbol.operations].after.forEach(operation => {
                operation(schema);
            });
        };

        let schema = cloneDeep(this[symbol.schema]);
        if (this[symbol.operations].before.length) schema = beforeOperations(schema);
        schema = buildJoi(schema);
        if (this[symbol.operations].after.length) afterOperations(schema);

        return schema;
    }

    use(...args) {
        return addOperation.before.call(this, 'use', args, function () {
            this[symbol.use] = true;
        });
    }
    skip(...args) {
        return addOperation.before.call(this, 'skip', args);
    }
    add(addSchema) {
        // todo validate schema
        return addOperation.before.call(this, 'add', addSchema);
    }
    safeAdd(addSchema) {
        // todo validate schema
        return addOperation.before.call(this, 'safeAdd', addSchema);
    }
    concat(concatSchema) {
        // todo validate schema
        return addOperation.before.call(this, 'concat', concatSchema);
    }
    safeConcat(concatSchema) {
        // todo validate schema
        return addOperation.before.call(this, 'safeConcat', concatSchema);
    }

    required(...args) {
        return addOperation.after.call(this, 'required', args);
    }
    optional(...args) {
        return addOperation.after.call(this, 'optional', args);
    }
    forbidden(...args) {
        return addOperation.after.call(this, 'forbidden', args);
    }
}

// Add each method for headers, body, cookies... (config.req)
const proto = ValidationSchema.prototype;
Object.getOwnPropertyNames(proto).filter(key => {
    try {
        return key !== 'constructor' && typeof proto[key] === 'function';
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

module.exports = ValidationSchema;
