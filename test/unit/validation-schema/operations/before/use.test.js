'use strict';
const { use } = require('../../../../../lib/validation-schema/operations').before;
const exSchema = require('../../_setup/ex-schema');

const id = (n) => `[${ String(n) }] `;

test(id(1) + `Doesn't mutate previous schema`, () => {
    const schema = exSchema();

    use(['a.a.a'])(schema, {});
    expect(schema).toEqual(exSchema());
});
test(id(2) + `Works with empty current`, () => {
    const schema = exSchema();
    const tests = [{
        fn: use('a.a.a'),
        result: { a: { a: { a: 1 } } }
    }, {
        fn: use(['a.a.a']),
        result: { a: { a: { a: 1 } } }
    }, {
        fn: use(['c']),
        result: { c: { a: { a: 8, b: 9 }, b: 10, c: 11 } }
    }, {
        fn: use(['a.a.a', 'a.a']),
        result: { a: { a: { a: 1, b: 2, c: { a: { a: 3 }, b: 4 } } } }
    }, {
        fn: use(['a.a.a', 'a.a.c.a', 'b.b']),
        result: {
            a: { a: { a: 1, c: { a: { a: 3 } } } },
            b: { b: { a: 7 } }
        }
    }];

    tests.forEach(({ fn, result }) => {
        const ans = {};
        fn(schema, ans);
        expect(ans).toEqual(result);
    });
});
test(id(3) + `Works with existing`, () => {
    const tests = [{
        fn: use('a.a.a'),
        result: { a: { a: { a: 1 } } }
    }, {
        fn: use(['a.a']),
        result: { a: { a: { a: 1, b: 2, c: { a: { a: 3 }, b: 4 } } } }
    }, {
        fn: use(['c']),
        result: {
            a: { a: { a: 1 } },
            c: { a: { a: 8, b: 9 }, b: 10, c: 11 }
        }
    }, {
        fn: use(['a.a.a', 'a.a']),
        result: { a: { a: { a: 1, b: 2, c: { a: { a: 3 }, b: 4 } } } }
    }, {
        fn: use(['a.a.c.a', 'b.b']),
        result: {
            a: { a: { a: 1, c: { a: { a: 3 } } } },
            b: { b: { a: 7 } }
        }
    }];

    const schema = exSchema();
    tests.forEach(({ fn, result }) => {
        const ans = { a: { a: { a: 1 } } };
        fn(schema, ans);
        expect(ans).toEqual(result);
    });
});
test(id(4) + `Fails on non existent key`, () => {
    const schema = exSchema();

    expect(() => use('d')(schema, {})).toThrow();
    expect(() => use('a.a.d')(schema, {})).toThrow();
    expect(() => use('a.a.b.c')(schema, {})).toThrow();
});
