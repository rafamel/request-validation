'use strict';
const id = (n) => `[${ String(n) }] `;
const deep = require('lodash.clonedeep');
const { concat } = require('../../../../../lib/validation-schema/operations/before');

// Mocked
jest.mock('joi');
const Joi = require('joi');
const mockConcat = jest.fn(function (other) {
    this.id = [this.id, other.id];
    return this;
});
let joiMockId = 0;
Joi.any.mockImplementation(() => ({
    isJoi: true,
    id: joiMockId++,
    concat: mockConcat
}));

test(id(1) + `Returns function`, () => {
    expect(typeof concat()).toBe('function');
});

test(id(2) + `Doesn't mutate previous schema`, () => {
    const schema = {
        a: {
            a: Joi.any(),
            b: Joi.any()
        },
        b: Joi.any(),
        c: Joi.any()
    };
    concat({ a: Joi.any() })(deep(schema), {});
    expect(schema).toEqual(schema);
});

test(id(3) + `Throws when attempting to concat to a non validation`, () => {
    const toConcat = {
        a: Joi.any(),
        c: Joi.any()
    };
    const current = {
        a: {
            b: Joi.any(),
            c: Joi.any()
        },
        b: Joi.any()
    };

    expect(() => concat(toConcat)(undefined, current)).toThrow();
});

test(id(4) + `Adds on empty current`, () => {
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

test(id(5) + `Maintains in current and concats if exists`, () => {
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
        mockConcat.mockClear();

        const current = exCurrent();
        calls = calls(deep(input));
        result = result(deep(input), deep(current));
        concat(input)(undefined, current);

        expect(current).toEqual(result);
        expect(mockConcat).toBeCalled();
        calls.forEach(call => {
            expect(mockConcat).toBeCalledWith(call);
        });
    });
});
