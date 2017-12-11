'use strict';
const { skip } = require('../../../../lib/validation-schema/operations').before;
const exSchema = require('../../_setup/ex-schema');

const id = (n) => `[${ String(n) }] `;

describe(`- skip`, () => {
    test(id(1) + `Doesn't mutate previous schema`, () => {
        const [ schema, current ] = [exSchema(), exSchema()];
        const fn = skip(['a.a.a']);
        fn(schema, current);
        expect(schema).toEqual(exSchema());
    });
    test(id(2) + `Works`, () => {
        const schema = exSchema();
        const tests = [{
            fn: skip('a'),
            result: {
                b: { a: 6, b: { a: 7 } },
                c: { a: { a: 8, b: 9 }, b: 10, c: 11 } }
        }, {
            fn: skip(['b', 'c', 'a.b', 'a.a.b', 'a.a.c']),
            result: { a: { a: { a: 1 } } }
        }, {
            fn: skip(['a', 'b']),
            result: { c: { a: { a: 8, b: 9 }, b: 10, c: 11 } }
        }, {
            fn: skip(['b.a', 'b', 'c', 'a.b']),
            result: { a: { a: { a: 1, b: 2, c: { a: { a: 3 }, b: 4 } } } }
        }, {
            fn: skip(['c', 'a.b', 'a.a.b', 'a.a.c.b', 'b.a']),
            result: {
                a: { a: { a: 1, c: { a: { a: 3 } } } },
                b: { b: { a: 7 } }
            }
        }];

        tests.forEach(({ fn, result }) => {
            const ans = exSchema();
            fn(schema, ans);
            expect(ans).toEqual(result);
        });
    });
    test(id(3) + `Fails on non existent key`, () => {
        const [ schema, current ] = [exSchema(), exSchema()];
        delete current.c;

        expect(() => skip('c')(schema, current)).toThrow();
        expect(() => skip('d')(schema, current)).toThrow();
        expect(() => skip('a.a.b.c')(schema, current)).toThrow();
    });
});
