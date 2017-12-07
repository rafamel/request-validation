'use strict';

module.exports = function parseInput(input, all = {}) {
    function helper(input, prefix = '') {
        function parseStr(str) {
            let current = all;
            (prefix + str).split('.').forEach((x, i, arr) => {
                if (current.hasOwnProperty(x) && i < (arr.length - 1)) {
                    current = current[x];
                    return;
                }
                current[x] = {}
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

        if (Array.isArray(input)) parseArr(input);
        else if (typeof input === 'object') parseObj(input);
        else if (typeof input === 'string') parseStr(input);
        else throw Error(); //chc
    }

    helper(input);
    return all;
};
