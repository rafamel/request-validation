'use strict';

// Parse input for .use() and .skip() operations
function parseInput(input) {
    const all = {};
    function helper(input, prefix = '') {
        function parseStr(str) {
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

        if (Array.isArray(input)) parseArr(input);
        else if (typeof input === 'object') parseObj(input);
        else if (typeof input === 'string') parseStr(input);
        else throw Error('Wrong type of argument for ValidationSchema.use() or ValidationSchema.skip()');
    }

    helper(input);
    return all;
}

function toEachStrings(input) {
    function toStrings(strings, obj, current) {
        const keys = Object.keys(obj);
        if (!keys.length) {
            strings.push(current);
            return;
        }
        Object.keys(obj).forEach(key => {
            toStrings(strings, obj[key], ((current ? current + '.' : '') + key));
        });
    }
    const parsed = parseInput(input);
    const stringsObj = {};
    Object.keys(parsed).forEach(key => {
        stringsObj[key] = [];
        toStrings(stringsObj[key], parsed[key]);
    });

    return stringsObj;
}

module.exports = {
    parseInput,
    toEachStrings
};
