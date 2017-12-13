'use strict';
const id = (n) => `[${ String(n) }] `;
const { mockConcat, removeMockFns } = require('../../_setup/joi.mock');
const Joi = require('joi');
const deep = require('lodash.clonedeep');
const { concat } = require('../../../../../lib/validation-schema/operations').before;
const exSchema = require('../../_setup/ex-schema');

test(id(1) + `Doesn't mutate previous schema`, () => {
    const schema = exSchema();
    const fn = concat({
        a: Joi.any()
    });
    fn(schema, {});
    expect(schema).toEqual(exSchema());
});

test(id(2) + `Adds on empty current`, () => {
    const tests = [{
        a: Joi.any()
    }, {
        a: {
            b: Joi.any(),
            c: Joi.any()
        },
        d: Joi.any()
    }];

    tests.forEach(toConcat => {
        const current = {};
        const result = deep(toConcat);
        concat(toConcat)({}, current);
        expect(current).toEqual(result);
    });
});

test(id(3) + `Maintains in current and concats if exists`, () => {
    const exCurrent = () => ({
        a: {
            b: Joi.any(),
            c: Joi.any()
        },
        b: Joi.any(),
        d: Joi.any()
    });

    const tests = [{
        input: {
            a: {
                b: Joi.any(),
                d: Joi.any()
            },
            c: Joi.any(),
            d: Joi.any()
        },
        result: (input, current) => {
            current.a.b.id = [current.a.b.id, input.a.b.id];
            current.d.id = [current.d.id, input.d.id];
            return {
                a: {
                    b: current.a.b,
                    c: current.a.c,
                    d: input.a.d
                },
                b: current.b,
                c: input.c,
                d: current.d
            };
        },
        calls: (input) => {
            return [
                input.a.b,
                input.d
            ];
        }
    }];

    tests.forEach(({ input, result, calls }) => {
        const current = exCurrent();
        calls = calls(deep(input));
        result = result(deep(input), deep(current));
        concat(input)(undefined, current);

        removeMockFns([current, result]);
        expect(current).toEqual(result);
        expect(mockConcat).toBeCalled();
        calls.forEach(call => {
            expect(mockConcat).toBeCalledWith(call);
        });
    });
});

test(id(4) + `Throws when attempting to concat to a non validation`, () => {
    const fn = concat({
        a: Joi.any(),
        c: Joi.any()
    });
    const current = {
        a: {
            b: Joi.any(),
            c: Joi.any()
        },
        b: Joi.any()
    };

    expect(() => fn(undefined, current)).toThrow();
});
