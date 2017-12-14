'use strict';
const id = (n) => `[${ String(n) }] `;
const deep = require('lodash.clonedeep');
const { add } = require('../../../../../lib/validation-schema/operations/before');

// Mocked
jest.mock('joi');
const Joi = require('joi');
let joiMockId = 0;
Joi.any.mockImplementation(() => ({ isJoi: true, id: joiMockId++ }));

const exSchema = () => ({ a: { a: { a: 1, b: 2 } }, c: 10 });

test(id(1) + `Returns function`, () => {
    expect(typeof add()).toBe('function');
});

test(id(2) + `Doesn't mutate previous schema`, () => {
    const schema = exSchema();

    add({ d: Joi.any() })(schema, {});
    expect(schema).toEqual(exSchema());
});

test(id(3) + `Works with empty current`, () => {
    const tests = [{
        a: Joi.any()
    }, {
        a: {
            b: Joi.any(),
            c: Joi.any()
        },
        d: Joi.any()
    }];

    tests.forEach(toAdd => {
        const current = {};
        const result = deep(toAdd);
        add(toAdd)({}, current);
        expect(current).toEqual(result);
    });
});

test(id(4) + `Maintains in current and overwrites if exists`, () => {
    const exCurrent = () => ({
        a: {
            b: Joi.any(),
            c: Joi.any()
        },
        b: Joi.any()
    });

    const tests = [{
        input: {
            a: Joi.any(),
            c: Joi.any()
        },
        result: (input, current) => ({
            a: input.a,
            b: current.b,
            c: input.c
        })
    }, {
        input: {
            a: {
                b: {
                    a: Joi.any(),
                    b: Joi.any()
                },
                d: Joi.any()
            }
        },
        result: (input, current) => ({
            a: {
                b: input.a.b,
                c: current.a.c,
                d: input.a.d
            },
            b: current.b
        })
    }];

    tests.forEach(({ input, result }) => {
        const current = exCurrent();
        result = result(deep(input), deep(current));
        add(input)(undefined, current);
        expect(current).toEqual(result);
    });
});
