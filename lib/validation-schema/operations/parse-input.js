'use strict';
const config = require('../../config');

const keyPathError = Error(`Failed to validate standard key path arguments. Please check the ${config.moduleName} documentation.`);

function pathTree(input) {
    const all = {};
    function helper(input, prefix = '') {
        function parseStr(str) {
            if (!str) return;
            let current = all;
            (prefix + str).split('.').forEach((x, i, arr) => {
                if (current.hasOwnProperty(x) && i < (arr.length - 1)) {
                    current = current[x];
                    return;
                }
                current[x] = {};
                current = current[x];
            });
        }
        function parseArr(arr) {
            arr.forEach(x => helper(x, prefix));
        }
        function parseObj(obj) {
            Object.keys(obj).forEach(key => {
                helper(obj[key], (prefix + key + '.'));
            });
        }

        // eslint-disable-next-line
        if (input === undefined) return;
        else if (Array.isArray(input)) parseArr(input);
        else if (typeof input === 'object') parseObj(input);
        else if (typeof input === 'string') parseStr(input);
        else throw keyPathError;
    }

    helper(input);
    return all;
}

function stringPaths(input) {
    function helper(input, str) {
        // eslint-disable-next-line
        if (input === undefined) return;
        else if (Array.isArray(input)) {
            input.forEach(x => helper(x, str));
        } else if (typeof input === 'object') {
            Object.keys(input).forEach(key => {
                helper(input[key], ((str) ? (str + '.' + key) : key));
            });
        } else if (typeof input === 'string') {
            arr.push((str) ? (str + '.' + input) : input);
        } else throw keyPathError;
    }
    const arr = [];
    helper(input);
    const ans = {};
    arr.forEach(item => {
        const parent = item.split('.', 1)[0];
        const child = item.slice(parent.length + 1);
        if (!child) return;
        if (!ans.hasOwnProperty(parent)) ans[parent] = [];
        ans[parent].push(child);
    });
    return ans;
}

module.exports = {
    pathTree,
    stringPaths
};
