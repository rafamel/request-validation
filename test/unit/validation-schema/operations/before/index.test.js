'use strict';
const id = (n) => `[${ String(n) }] `;
const { before } = require('../../../../../lib/validation-schema/operations');

test(id(1) + `All before operations return a function to be later run`, () => {
    expect(typeof before.use()).toBe('function');
    expect(typeof before.skip()).toBe('function');
    expect(typeof before.add()).toBe('function');
    expect(typeof before.concat()).toBe('function');
});
