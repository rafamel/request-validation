'use strict';
const id = (n) => `[${ String(n) }] `;
const { parseInput, toEachStrings } = require('../../../../lib/validation-schema/operations/parse-input');

describe(`- parseInput`, () => {
    test(id(1) + `empty & wrong type`, () => {
        expect(parseInput()).toEqual({});
        expect(parseInput({})).toEqual({});
        expect(parseInput('')).toEqual({});
        expect(() => parseInput(5)).toThrow();
    });
    test(id(2) + `strings`, () => {
        const tests = [{
            input: 'body',
            output: { body: {} }
        }, {
            input: 'body.a',
            output: { body: { a: {} } }
        }, {
            input: 'body.a.b.c',
            output: { body: { a: { b: { c: {} } } } }
        }, {
            input: ['body.a.b.c', 'body.a.c.d'],
            output: { body: { a: { b: { c: {} }, c: { d: {} } } } }
        }, {
            input: ['body.a.b.c', 'body.a.c', 'params.d.c', 'params.d.e.f'],
            output: {
                body: { a: { b: { c: {} }, c: {} } },
                params: { d: { c: {}, e: { f: {} } } }
            }
        }];

        tests.forEach(({ input, output }) => {
            expect(parseInput(input)).toEqual(output);
        });
    });
    test(id(3) + `objects`, () => {
        const tests = [{
            input: { body: 'a' },
            output: { body: { a: {} } }
        }, {
            input: { body: { a: 'b.c' } },
            output: { body: { a: { b: { c: {} } } } }
        }, {
            input: { body: { a: { b: 'c', c: 'd' } } },
            output: { body: { a: { b: { c: {} }, c: { d: {} } } } }
        }, {
            input: {
                body: { a: [{ b: 'c' }, 'c'] },
                params: { d: ['c', { e: 'f' }] }
            },
            output: {
                body: { a: { b: { c: {} }, c: {} } },
                params: { d: { c: {}, e: { f: {} } } }
            }
        }, {
            input: [{
                body: { a: [{ b: 'c' }, 'c'] }
            }, {
                params: { d: ['c', { e: 'f' }] }
            }],
            output: {
                body: { a: { b: { c: {} }, c: {} } },
                params: { d: { c: {}, e: { f: {} } } }
            }
        }];

        tests.forEach(({ input, output }) => {
            expect(parseInput(input)).toEqual(output);
        });
    });
});

describe(`- toEachStrings`, () => {
    test(id(1) + `empty`, () => {
        expect(toEachStrings()).toEqual({});
        expect(toEachStrings({})).toEqual({});
        expect(toEachStrings('')).toEqual({});
        expect(() => toEachStrings(5)).toThrow();
    });
    test(id(2) + `strings`, () => {
        const tests = [{
            input: 'body.a',
            output: { body: ['a'] }
        }, {
            input: 'body.a.b.c',
            output: { body: ['a.b.c'] }
        }, {
            input: ['body.a.b.c', 'body.a.c.d'],
            output: { body: ['a.b.c', 'a.c.d'] }
        }, {
            input: ['body.a.b.c', 'body.a.c', 'params.d.c', 'params.d.e.f'],
            output: { body: ['a.b.c', 'a.c'], params: ['d.c', 'd.e.f'] }
        }, {
            input: ['body.a.b.c', 'body.a.c', 'body.b.a.c', 'body.a', 'body.a.b', 'body.b.a'],
            output: {
                body: ['a.b.c', 'a.c', 'b.a.c', 'a', 'a.b', 'b.a']
            }
        }];

        tests.forEach(({ input, output }) => {
            expect(toEachStrings(input)).toEqual(output);
        });
    });
    test(id(3) + `objects`, () => {
        const tests = [{
            input: { body: 'a' },
            output: { body: ['a'] }
        }, {
            input: { body: { a: 'b.c' } },
            output: { body: ['a.b.c'] }
        }, {
            input: { body: { a: { b: 'c', c: 'd' } } },
            output: { body: ['a.b.c', 'a.c.d'] }
        }, {
            input: {
                body: { a: [{ b: 'c' }, 'c'] },
                params: { d: ['c', { e: 'f' }] }
            },
            output: {
                body: ['a.b.c', 'a.c'],
                params: ['d.c', 'd.e.f']
            }
        }, {
            input: [{
                body: { a: [{ b: 'c' }, 'c'] }
            }, {
                params: { d: ['c', { e: 'f' }] }
            }],
            output: {
                body: ['a.b.c', 'a.c'],
                params: ['d.c', 'd.e.f']
            }
        }, {
            input: [{
                body: { a: [{ b: 'c' }, 'c'], b: { a: 'c' } }
            }, {
                body: 'a'
            }, {
                body: { a: 'b' }
            }, {
                body: 'b.a'
            }],
            output: {
                body: ['a.b.c', 'a.c', 'b.a.c', 'a', 'a.b', 'b.a']
            }
        }];

        tests.forEach(({ input, output }) => {
            expect(toEachStrings(input)).toEqual(output);
        });
    });
});
