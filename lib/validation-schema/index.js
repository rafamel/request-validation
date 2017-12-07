'use strict';
const Joi = require('joi');
const merge = require('lodash.merge');
const cloneDeep = require('lodash.clonedeep');
const proxier = require('./proxier');
const parseInput = require('./parse-input');
const config = require('../config');

function buildUse() {
    const use = {};
    config.req.forEach(x => { use[x] = {}; });
    return use
}

class ValidationSchema {
    constructor(obj) {
        // todo check obj
        this.schema = obj;
        this._use = buildUse();
    }
    get tree() {
        if (!this._skip) return this.schema;
        const schema = cloneDeep(this.schema);

        // Build schema
        const build = (onUse, onSchema) => {
            if (onSchema.isJoi) return;
            Object.keys(onSchema).forEach(key => {
                if (onUse.hasOwnProperty(key)) {
                    if (!Object.keys(onUse[key]).length) return;
                    return build(onUse[key], onSchema[key]);
                }
                delete onSchema[key];
            });
        };
        build(this._use, schema);

        // Clean
        const clean = (current) => {
            if (current.isJoi) return;
            Object.keys(current).forEach(key => {
                if (Object.keys(current[key]).length) {
                    return clean(current[key]);
                }
                delete current[key];
            });
        };
        clean(schema);

        return schema;
    }
    skip(...args) {
        const clone = cloneDeep(this);

        if (!args.length || args[0] == undefined) clone._use = {};
        else {
            // todo
            // parseInput(args, clone._use);
        }

        return proxier(clone);
    }
    use(...args) {
        const clone = cloneDeep(this);
        clone._skip = true;

        if (!args.length || args[0] == undefined) clone._use = buildUse();
        else parseInput(args, clone._use);

        return proxier(clone);
    }
}

module.exports = function (obj) {
    return proxier(new ValidationSchema(obj));
};
