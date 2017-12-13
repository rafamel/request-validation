'use strict';
const Joi = require('joi');
const ValidationSchema = require('../../lib/validation-schema');
const config = require('../../lib/config');

const id = (n) => `[${ String(n) }] `;

const buildObj = (item, obj) => {
    const ans = {};
    ans[item] = obj;
    return ans;
};
const exSchema = (item) => (new ValidationSchema(buildObj(item, {
    a: Joi.string().required(),
    b: Joi.string().required(),
    c: Joi.string().required(),
    d: {
        a: Joi.number(),
        b: Joi.number().required()
    },
    e: {
        a: Joi.string(),
        b: Joi.number(),
        c: Joi.string(),
        d: Joi.number()
    },
    f: {
        a: Joi.string().required(),
        b: Joi.number().required(),
        c: Joi.string().required(),
        d: Joi.number().required()
    }
})));

describe(`- ValidationSchema integration`, () => {
    describe(`- Base Schema`, () => {
        test(id(1), () => {
            const schema = new ValidationSchema({
                body: { a: Joi.string() },
                headers: Joi.any()
            });
            expect(schema.headers).toHaveProperty('isJoi', true);
            expect(schema.body).toHaveProperty('isJoi', true);
            expect(() => Joi.assert({ a: 'str' }, schema.body)).not.toThrow();
            expect(() => Joi.assert({ a: 5 }, schema.body)).toThrow();
        });
    });

    describe(`- Each`, () => {
        config.req.forEach(item => test(`- ${item}`, () => {
            const schema = exSchema(item);
            const tests = [{
                schema: schema.use(`${item}.a`),
                pass: [{ a: 'a' }],
                fail: [{ a: 5 }]
            }, {
                schema: schema.use(`${item}.a`, `${item}.b`),
                pass: [{ a: 'a', b: 'b' }],
                fail: [{ a: 'a' }, { b: 'b' }]
            }, {
                schema: schema.use(`${item}.a`).use(`${item}.b`),
                pass: [{ a: 'a', b: 'b' }],
                fail: [{ a: 'a' }, { b: 'b' }]
            }, {
                schema: schema.use(buildObj(item, ['a', 'b'])),
                pass: [{ a: 'a', b: 'b' }],
                fail: [{ b: 'b' }, { a: 'a' }]
            }, {
                schema: schema,
                pass: [{ a: 'a', b: 'b', c: 'a' }],
                fail: [{ a: 'a', b: 'b' }]
            }, {
                schema: schema.skip(`${item}.d`, `${item}.c`),
                pass: [{ a: 'a', b: 'b' }],
                fail: [{ b: 'b' }, { a: 'a' }]
            }, {
                schema: schema.skip(`${item}.d`).skip(`${item}.c`),
                pass: [{ a: 'a', b: 'b' }],
                fail: [{ b: 'b' }, { a: 'a' }]
            }, {
                schema: schema.use(`${item}.a`).skip(`${item}.b`),
                fail: [{ a: 'a' }]
            }, {
                schema: schema.use(`${item}.d`).skip(`${item}.d`).use(`${item}.a`),
                pass: [{ a: 'a' }]
            }, {
                schema: schema.use(`${item}.d`).skip(`${item}.d.b`),
                pass: [{ d: { a: 5 } }]
            }, {
                schema: schema.use(`${item}.d`),
                fail: [{ d: { a: 5 } }]
            }, {
                schema: schema.use(`${item}.a`).add(buildObj(item, {
                    a: Joi.number().required(),
                    i: Joi.number().required()
                })),
                pass: [{ a: 1, i: 1 }],
                fail: [{ a: 'str' }, { a: 1 }, { i: 1 }]
            }, {
                schema: schema.use(`${item}.a`).concat(buildObj(item, {
                    a: Joi.string().min(6),
                    i: Joi.number().required()
                })),
                pass: [{ a: '123456', i: 1 }],
                fail: [{ a: '12345', i: 1 }, { a: '123456' }, { i: 1 }]
            }, {
                schema: schema.use(`${item}.e`)
                    .required(`${item}.e.a`)
                    .required(buildObj(item, ['e.c'])),
                pass: [
                    { e: { a: 'a', c: 'c' } },
                    { e: { a: 'a', c: 'c', b: 4, d: 4 } }
                ],
                fail: [
                    { e: { a: 'a' } },
                    { e: { c: 'c' } },
                    { e: { a: 5, c: 'c' } },
                    { e: { a: 'a', c: 5 } },
                    { e: { a: 'a', c: 'c', b: 'b', d: 4 } },
                    { e: { a: 'a', c: 'c', b: 4, d: 'd' } }
                ]
            }, {
                schema: schema.use(`${item}.f`)
                    .optional(`${item}.f.a`)
                    .optional(buildObj(item, ['f.c'])),
                pass: [
                    { f: { b: 2, d: 2 } },
                    { f: { a: 'a', c: 'c', b: 4, d: 4 } }
                ],
                fail: [
                    { f: { d: 2 } },
                    { f: { b: 2 } },
                    { f: { a: 'a', c: 2, b: 4, d: 4 } },
                    { f: { a: 2, c: 'c', b: 4, d: 4 } }
                ]
            }, {
                schema: schema.use(`${item}.e`),
                pass: [{}]
            }, {
                schema: schema.use(`${item}.e`)
                    .options({ defaults: { presence: 'required' } }),
                pass: [{ e: { a: 'a', b: 2, c: 'c', d: 4 } }],
                fail: [{}, { e: { a: 'a', b: 2, c: 'c' } }]
            }, {
                schema: schema.use(`${item}.e`)
                    .options({ defaults: { presence: 'required' } })
                    .options(buildObj(item, { presence: 'optional' })),
                pass: [{}]
            }, {
                schema: schema.use(`${item}.e`).presence('required'),
                pass: [{ e: { a: 'a', b: 2, c: 'c', d: 4 } }],
                fail: [{}, { e: { a: 'a', b: 2, c: 'c' } }]
            }, {
                schema: schema.use(`${item}.e`)
                    .presence({ defaults: 'required' }),
                pass: [{ e: { a: 'a', b: 2, c: 'c', d: 4 } }],
                fail: [{}, { e: { a: 'a', b: 2, c: 'c' } }]
            }, {
                schema: schema.use(`${item}.e`)
                    .presence('required')
                    .presence(buildObj(item, 'optional')),
                pass: [{}]
            }];

            tests.forEach(({ schema, pass, fail }) => {
                if (pass) {
                    pass.forEach(obj => {
                        expect(() => Joi.assert(obj, schema[item]))
                            .not.toThrow();
                    });
                }
                if (fail) {
                    fail.forEach(obj => {
                        expect(() => Joi.assert(obj, schema[item]))
                            .toThrow();
                    });
                }
            });
        }));
    });

    describe(`- Options build and clean`, () => {
        test(id(1) + `- Options fails when inexistent key`, () => {
            const schema = new ValidationSchema({
                body: { a: Joi.any() }
            });
            expect(
                () => schema.options({ body: { presence: 'required' } }).schema
            ).not.toThrow();
            expect(
                () => schema.presence({ body: 'required' }).schema
            ).not.toThrow();
            expect(
                () => schema.options({ headers: { presence: 'required' } }).schema
            ).toThrow();
            expect(
                () => schema.presence({ headers: 'required' }).schema
            ).toThrow();
        });
        test(id(2) + `- Empty keys are cleared`, () => {
            const schema = new ValidationSchema({
                body: { a: Joi.any() },
                headers: {
                    a: Joi.any(),
                    b: { a: Joi.any(), b: Joi.any() }
                }
            }).skip('body.a', 'headers.b.a', 'headers.b.b').schema;

            expect(schema).not.toHaveProperty('body');
            expect(schema).toHaveProperty('headers');
            expect(() => schema.headers.requiredKeys('a')).not.toThrow();
            expect(() => schema.headers.requiredKeys('b')).toThrow();
        });
    });
});
