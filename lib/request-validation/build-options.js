'use strict';
const merge = require('lodash.merge');
const checker = require('../checker');
const config = require('../config');

module.exports = function buildOptions(obj = {}, base = config.options) {
    checker.options(obj);
    const defaults = obj.hasOwnProperty('defaults')
        ? merge({}, base, obj.defaults)
        : base;
    const ans = {};
    config.req.forEach(x => {
        ans[x] = (obj.hasOwnProperty(x))
            ? merge({}, defaults, obj[x])
            : defaults;
    });
    return ans;
};
