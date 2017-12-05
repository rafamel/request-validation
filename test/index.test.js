'use strict';
// const config = require('../lib/config');
// const RequestValidation = require('../lib');

const id = (n) => `[${ String(n) }] `;

describe(`- RequestValidation`, () => {
    test(id(1) + `Ex. 1`, () => {
        expect(1 + 1).toBe(2);
    });
    test(id(2) + `Ex. 2`, () => {
        expect(2 + 3).not.toBe(6);
    });
});
