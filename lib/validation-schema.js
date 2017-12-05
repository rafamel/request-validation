'use strict';
const Joi = require('joi');
const config = require('./config');
const merge = require('lodash.merge');

class ValidationSchema {
    constructor(obj) {
        Joi.assert(
            obj,
            Joi.object().pattern(/.*/, Joi.object().schema()),
            Error(`validation schema must have a Joi schema for each key (${ config.moduleName })`)
        );
        merge(this, obj);
    }
    use(arr) {
        Joi.assert(arr, Joi.array().items(Joi.string()).required(),
            Error(`validation schema .use() method didn't receive an array of strings (${ config.moduleName })`));

        const newSchema = {};
        for (let key of arr) {
            if (!this.hasOwnProperty(key)) {
                throw Error(`Key ${ key } passed to .use() doesn't exist in the schema (${ config.moduleName })`);
            } else newSchema[key] = this[key];
        }
        return new ValidationSchema(newSchema);
    }
    joi() {
        return Joi.object().keys(this);
    }
};

module.exports = ValidationSchema;
