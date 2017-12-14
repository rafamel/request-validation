'use strict';
const id = (n) => `[${ String(n) }] `;
const { use } = require('../../../../../lib/validation-schema/operations/before');

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
    expect(typeof use()).toBe('function');
});

test(id(2) + `Doesn't mutate previous schema, calls pathTree`, () => {
    const schema = exSchema();
    const current = {};
    use({ a: { b: { c: {} } } })(schema, current);

    expect(schema).toEqual(exSchema());
    expect(schema).not.toEqual(current);
    expect(pathTree).toHaveBeenCalledWith({ a: { b: { c: {} } } });
});

test(id(3) + `Works with empty & existing current`, () => {
    const schema = exSchema();
    const exExisting = () => ({ a: { a: { a: 1 } } });
    const tests = [{
        input: { a: { a: { a: {} } } },
        result: [{ a: { a: { a: schema.a.a.a } } }]
    }, {
        input: { a: {} },
        result: [{ a: schema.a }]
    }, {
        input: { a: { a: {} } },
        result: [{ a: { a: schema.a.a } }]
    }, {
        input: { a: { b: { b: {} }, c: {} }, b: {} },
        result: [{
            a: { b: { b: schema.a.b.b }, c: schema.a.c },
            b: schema.b
        }, {
            a: {
                a: { a: 1 },
                b: { b: schema.a.b.b },
                c: schema.a.c
            },
            b: schema.b
        }]
    }];

    tests.forEach(({ input, result }) => {
        // Empty
        let ans = {};
        use(input)(schema, ans);
        expect(ans).toEqual(result[0]);

        // Existing
        ans = exExisting();
        use(input)(schema, ans);
        expect(ans).toEqual(result[1] || result[0]);
    });
});

test(id(4) + `Fails on non existent key`, () => {
    const schema = exSchema();

    expect(() => use({ d: {} })(schema, {})).toThrow();
    expect(() => use({ a: { d: {} } })(schema, {})).toThrow();
    expect(() => use({ c: { a: {} } })(schema, {})).toThrow();
});
