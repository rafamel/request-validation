'use strict';
const { before } = require('../../../../lib/validation-schema/operations');

const id = (n) => `[${ String(n) }] `;

describe(`- all`, () => {
    test(id(1) + `return function`, () => {
        expect(typeof before.use()).toBe('function');
        expect(typeof before.skip()).toBe('function');
        expect(typeof before.add()).toBe('function');
        expect(typeof before.concat()).toBe('function');
    });
});
