'use strict';
const id = (n) => `[${ String(n) }] `;
const { skip } = require('../../../../../lib/validation-schema/operations/before');

// Mocks
jest.mock('../../../../../lib/validation-schema/operations/parse-input');
const { pathTree } = require('../../../../../lib/validation-schema/operations/parse-input');
pathTree.mockImplementation((x) => x);

const exSchema = () => ({
    a: {
        a: { a: 1, b: 2, c: 3 },
        b: { a: 4, b: 5, c: 6 },
        c: { a: 1, b: 2, c: 3 }
    },
    b: { a: 7, b: 8, c: 9 },
    c: 10
});

test(id(1) + `Returns function`, () => {
    expect(typeof skip()).toBe('function');
});

test(id(2) + `Doesn't mutate previous schema, calls pathTree`, () => {
    const schema = exSchema();
    const current = exSchema();
    skip({ a: { b: { c: {} } } })(schema, current);

    expect(schema).toEqual(exSchema());
    expect(schema).not.toEqual(current);
    expect(pathTree).toHaveBeenCalledWith({ a: { b: { c: {} } } });
});

test(id(3) + `Works`, () => {
    const schema = exSchema();
    const tests = [{
        input: { a: {} },
        result: { b: schema.b, c: schema.c }
    }, {
        input: {
            a: { a: { b: {}, c: {} }, b: {} },
            b: {},
            c: {}
        },
        result: { a: { a: { a: schema.a.a.a }, c: schema.a.c } }
    }, {
        input: { a: {}, b: {} },
        result: { c: schema.c }
    }, {
        input: {
            a: { b: {} },
            b: {},
            c: {}
        },
        result: { a: { a: schema.a.a, c: schema.a.c } }
    }, {
        input: {
            a: { a: { b: {}, c: {} }, b: {} },
            b: { a: {} }
        },
        result: {
            a: {
                a: { a: schema.a.a.a },
                c: schema.a.c
            },
            b: { b: schema.b.b, c: schema.b.c },
            c: schema.c
        }
    }];

    tests.forEach(({ input, result }) => {
        const ans = exSchema();
        skip(input)(schema, ans);
        expect(ans).toEqual(result);
    });
});

test(id(4) + `Fails on non existent key`, () => {
    const schema = exSchema();

    expect(() => skip({ d: {} })(schema, {})).toThrow();
    expect(() => skip({ a: { d: {} } })(schema, {})).toThrow();
    expect(() => skip({ c: { a: {} } })(schema, {})).toThrow();
});
