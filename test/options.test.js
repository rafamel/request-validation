'use strict';
const config = require('../lib/config');
const RequestValidation = require('../lib');
const options = RequestValidation.options;

const id = (n) => `[${ String(n) }] `;

describe(`- .options() / buildOptions()`, () => {
    test(id(1) + `Empty case`, () => {
        const opts = options();
        config.req.forEach(x => {
            expect(opts).toHaveProperty(x);
            expect(opts[x]).toEqual(config.options);
        });
    });
    test(id(2) + `Takes right input`, () => {
        const input = {
            default: { some: 1 },
            headers: { some: 1 },
            body: { some: 1 },
            query: { some: 1 },
            params: { some: 1 },
            cookies: { some: 1 }
        };
        config.req.forEach(x => { input[x] = { some: 2 }; });

        expect(() => options(input)).not.toThrow();
    });
    test(id(3) + `Throws on wrong input`, () => {
        const inputs = [
            { default: 1 },
            { headers: '' },
            { body: [] },
            { query: 1 },
            { params: 1 },
            { cookies: 1 },
            { some: { other: 1 } }
        ];
        inputs.forEach(x => {
            expect(() => options(x)).toThrow();
        });
    });
    test(id(4) + `Default provided`, () => {
        const opts = options({ default: { a: 1 } });
        const res = Object.assign({ a: 1 }, config.options);
        config.req.forEach(x => {
            expect(opts[x]).toEqual(res);
        });
    });
    test(id(5) + `Default overwriten`, () => {
        const opts = options({ default: { abortEarly: false } });
        const res = Object.assign({}, config.options, { abortEarly: false });
        config.req.forEach(x => {
            expect(opts[x]).toEqual(res);
        });
    });
    test(id(6) + `One req differs`, () => {
        const opts = options({ headers: { abortEarly: false } });
        const res = Object.assign({}, config.options, { abortEarly: false });
        config.req.forEach(x => {
            if (x === 'headers') {
                expect(opts[x]).toEqual(res);
            } else {
                expect(opts[x]).toEqual(config.options);
            }
        });
    });
    test(id(7) + `One req differs + default`, () => {
        const opts = options({
            default: { convert: true },
            headers: { abortEarly: false }
        });
        const res1 = Object.assign({}, config.options, { convert: true });
        const res2 = Object.assign({}, res1, { abortEarly: false });
        config.req.forEach(x => {
            if (x === 'headers') {
                expect(opts[x]).toEqual(res2);
            } else {
                expect(opts[x]).toEqual(res1);
            }
        });
    });
    test(id(8) + `One req differs + default (same)`, () => {
        const opts = options({
            default: { abortEarly: false },
            headers: { abortEarly: true }
        });
        const res1 = Object.assign({}, config.options, { abortEarly: false });
        const res2 = Object.assign({}, res1, { abortEarly: true });
        config.req.forEach(x => {
            if (x === 'headers') {
                expect(opts[x]).toEqual(res2);
            } else {
                expect(opts[x]).toEqual(res1);
            }
        });
    });
});
