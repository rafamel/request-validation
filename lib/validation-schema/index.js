'use strict';
const Joi = require('joi');
const merge = require('lodash.merge');
const clone = require('lodash.clone');
const cloneDeep = require('lodash.clonedeep');
const methodsGetters = require('./methods-getters');
const checker = require('../checker');

const symbol = {
    schema: Symbol('schema'),
    options: Symbol('options'),
    operations: Symbol('operations')
};
const addOperation = require('./add-operation')(symbol);

class ValidationSchema {
    constructor(schema) {
        checker.schema(schema);
        this[symbol.schema] = schema;
        this[symbol.options] = {};
        this[symbol.operations] = {
            use: false,
            before: [],
            after: []
        };
    }

    clear() {
        const cleared = new ValidationSchema(this[symbol.schema]);
        return cleared;
    }

    set schema(schema) {
        checker.schema(schema);
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
            const current = (this[symbol.operations].use) ? {} : schema;
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
        const parseOptions = (schema) => {
            const options = this[symbol.options];
            if (options.hasOwnProperty('defaults')) {
                Object.keys(schema).forEach(key => {
                    if (!options.hasOwnProperty(key)) {
                        options[key] = options.defaults;
                    } else {
                        options[key] = merge({}, options.defaults, options[key]);
                    }
                });
                delete options.defaults;
            }
            Object.keys(options).forEach(key => {
                if (!schema.hasOwnProperty(key)) {
                    throw Error(`Key ${key} doesn't exist for ValidationSchema options()`);
                }
                schema[key] = schema[key].options(options[key]);
            });
        };

        let schema = cloneDeep(this[symbol.schema]);
        if (this[symbol.operations].before.length) {
            schema = beforeOperations(schema);
        }
        schema = buildJoi(schema);
        if (this[symbol.operations].after.length) {
            afterOperations(schema);
        }
        parseOptions(schema);

        return schema;
    }

    use(...args) {
        // todo if no args, don't use anything
        return addOperation.before.call(this, 'use', args, function () {
            this[symbol.operations].use = true;
        });
    }
    skip(...args) {
        return addOperation.before.call(this, 'skip', args);
    }
    add(addSchema) {
        checker.schema(addSchema);
        return addOperation.before.call(this, 'add', addSchema);
    }
    concat(concatSchema) {
        checker.schema(concatSchema);
        return addOperation.before.call(this, 'concat', concatSchema);
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

    options(opts) {
        checker.options(opts);
        const cloned = clone(this);
        cloned[symbol.options] = merge({}, cloned[symbol.options], opts);
        return cloned;
    }
    presence(obj) {
        checker.presence(obj);
        if (typeof obj === 'string') obj = { defaults: obj };
        Object.keys(obj).forEach(key => {
            obj[key] = { presence: obj[key] };
        });
        return this.options(obj);
    }
}

// Add extra methods and getters to prototype
methodsGetters(ValidationSchema.prototype);
module.exports = ValidationSchema;
