'use strict';
require('../../_setup/joi.mock');
const Joi = require('joi');
const deep = require('lodash.clonedeep');
const { add } = require('../../../../lib/validation-schema/operations').before;
const exSchema = require('../../_setup/ex-schema');

const id = (n) => `[${ String(n) }] `;

describe(`- add`, () => {
    test(id(1) + `Doesn't mutate previous schema`, () => {
        const schema = exSchema();
        const fn = add({
            a: Joi.any()
        });
        fn(schema, {});
        expect(schema).toEqual(exSchema());
    });
    test(id(2) + `Works with empty current`, () => {
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
    test(id(3) + `Maintains in current and overwrites if exists`, () => {
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
            const current = {
                a: {
                    b: Joi.any(),
                    c: Joi.any()
                },
                b: Joi.any()
            };
            result = result(deep(input), deep(current));
            add(input)(undefined, current);
            expect(current).toEqual(result);
        });
    });
});
