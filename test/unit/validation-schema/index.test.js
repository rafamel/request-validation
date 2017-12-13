'use strict';
const id = (n) => `[${ String(n) }] `;
const Joi = require('joi');
const deep = require('lodash.clonedeep');
const ValidationSchema = require('../../../lib/validation-schema');
const config = require('../../../lib/config');

// Spied on
const before = require('../../../lib/validation-schema/operations/before');
const after = require('../../../lib/validation-schema/operations/after');
const checker = require('../../../lib/checker');
jest.spyOn(checker, 'schema');

const exJoi = { isJoi: true };
const exSchema = () => (new ValidationSchema({
    body: {
        a: Joi.any(),
        b: Joi.any(),
        c: {
            a: Joi.any(),
            b: Joi.any()
        }
    },
    headers: {
        a: Joi.any(),
        b: Joi.any(),
        c: {
            a: Joi.any(),
            b: Joi.any()
        }
    },
    params: {
        a: Joi.any(),
        b: Joi.any(),
        c: {
            a: Joi.any(),
            b: Joi.any()
        }
    }
}));

describe(`- Calls schema checker (constructor, set schema, add, concat)`, () => {
    test(id(1) + `Fails on wrong input`, () => {
        const tests = [
            null,
            undefined,
            {},
            { hello: 1 },
            { headers: { a: 1, b: { c: 2, d: 3 } } }
        ];

        tests.forEach(item => {
            const arg = deep(item);

            expect(() => new ValidationSchema(item)).toThrow();
            expect(checker.schema).toBeCalledWith(arg);

            checker.schema.mockImplementationOnce(() => {});
            const schema = new ValidationSchema();

            checker.schema.mockClear();
            expect(() => { schema.schema = item; }).toThrow();
            expect(checker.schema).toBeCalledWith(arg);

            checker.schema.mockClear();
            expect(() => schema.add(item)).toThrow();
            expect(checker.schema).toBeCalledWith(arg);

            checker.schema.mockClear();
            expect(() => schema.concat(item)).toThrow();
            expect(checker.schema).toBeCalledWith(arg);
        });
    });
    test(id(2) + `Passes on correct input`, () => {
        const tests = [
            { body: exJoi }
        ];

        tests.forEach(item => {
            const arg = deep(item);

            let schema;
            expect(() => { schema = new ValidationSchema(item); }).not.toThrow();
            expect(checker.schema).toBeCalledWith(arg);

            checker.schema.mockClear();
            expect(() => { schema.schema = item; }).not.toThrow();
            expect(checker.schema).toBeCalledWith(arg);

            checker.schema.mockClear();
            expect(() => schema.add(item)).not.toThrow();
            expect(checker.schema).toBeCalledWith(arg);

            checker.schema.mockClear();
            expect(() => schema.concat(item)).not.toThrow();
            expect(checker.schema).toBeCalledWith(arg);
        });
    });
});
describe(`- .schema`, () => {
    test(id(1) + `get`, () => {
        const schema = (new ValidationSchema({
            body: { some: exJoi, else: exJoi },
            headers: { some: exJoi, else: exJoi }
        })).schema;

        expect(schema).toHaveProperty('body');
        expect(schema).toHaveProperty('headers');
        expect(schema.body).toHaveProperty('isJoi', true);
        expect(schema.headers).toHaveProperty('isJoi', true);
    });
    test(id(2) + `set`, () => {
        const validation = new ValidationSchema({
            body: { some: exJoi, else: exJoi }
        });
        validation.schema = { headers: { some: exJoi, else: exJoi } };
        const schema = validation.schema;

        expect(schema).not.toHaveProperty('body');
        expect(schema).toHaveProperty('headers');
        expect(schema.headers).toHaveProperty('isJoi', true);
    });
    test(id(3) + `aliases`, () => {
        config.req.forEach(key => {
            const obj = {};
            obj[key] = {};
            obj[key][key] = Joi.any();
            const schema = new ValidationSchema(obj);

            expect(schema.schema[key] === schema[key]);
            config.req.forEach(innerKey => {
                if (innerKey === key) return;
                expect(schema.schema).not.toHaveProperty(innerKey);
                expect(schema[innerKey]).toBe(undefined);
            });
        });
    });
});
describe(`- operations`, () => {
    describe(`- Taking standard key path`, () => {
        const args = ['body.c.b', 'body.a', { headers: ['c.a', 'a'] }, 'params.a'];
        const tests = {
            before: ['use', 'skip'],
            after: ['required', 'optional', 'forbidden']
        };
        Object.keys(tests).forEach(beforeAfter => describe(`- ${beforeAfter}`, () => {
            const mockFn = (beforeAfter === 'before')
                ? before
                : after;
            const operations = tests[beforeAfter];

            operations.forEach(op => describe(`- ${op}()`, () => {
                jest.spyOn(mockFn, op);

                test(id(1) + `calls addOperation.${beforeAfter} with arr of args`, () => {
                    exSchema()[op](deep(args));
                    expect(mockFn[op]).lastCalledWith([args]);
                    exSchema()[op](...deep(args));
                    expect(mockFn[op]).lastCalledWith(args);
                });
                test(id(2) + `unmodified when no arguments`, () => {
                    const schema = exSchema();
                    const used = schema[op]();
                    expect(used).toEqual(exSchema());
                });
                test(id(3) + `no mutation`, () => {
                    const schema = exSchema();
                    const used = schema[op](deep(args)).schema;

                    expect(used.body).toHaveProperty('isJoi');
                    used.body.optional();
                    used.body.d = 0;
                    expect(schema).toEqual(exSchema());
                });
            }));
        }));
    });
    describe(`- Taking schema (before)`, () => {
        const operations = ['add', 'concat'];
        const input = { body: { a: Joi.any() } };

        operations.forEach(op => describe(`- ${op}()`, () => {
            jest.spyOn(before, op);

            test(id(1) + `calls addOperation.before with schema`, () => {
                exSchema()[op](deep(input));
                expect(before[op]).lastCalledWith(input);
            });
            test(id(2) + `throws when no arguments`, () => {
                expect(() => exSchema()[op]()).toThrow();
            });
            test(id(3) + `no mutation`, () => {
                const schema = exSchema();
                const used = schema[op](deep(input)).schema;

                expect(used.body).toHaveProperty('isJoi');
                used.body.optional();
                used.body.d = 0;
                expect(schema).toEqual(exSchema());
            });
        }));
    });
});
describe(`- clear`, () => {
    test(id(1), () => {
        const schemaA = exSchema()
            .use('body.c')
            .skip('body.c.b')
            .add({ headers: { a: Joi.any() } })
            .concat({ body: { d: Joi.any() } })
            .required('body.c')
            .optional('body.d')
            .forbidden('headers.a')
            .options({ defaults: { abortEarly: false } })
            .presence('required');
        const schemaB = schemaA
            .clear()
            .schema;

        expect(schemaB).toEqual(exSchema().schema);
    });
});
describe(`- method aliases`, () => {
    const schema = exSchema();
    const all = ['use', 'skip', 'add', 'concat', 'required',
        'optional', 'forbidden', 'options', 'presence'];
    const inputs = [
        [null],
        [undefined],
        [5],
        [{}],
        [{ some: {} }],
        [{ body: { key: exJoi } }],
        [{ some: { exJoi } }],
        [{ some: { exJoi } }, { body: { key: exJoi } }, null, undefined]
    ];
    all.forEach(method => {
        test(`- ${method}`, () => {
            schema[method] = jest.fn();

            config.req.forEach(item => {
                const methodName = method + item[0].toUpperCase() + item.slice(1);

                schema[methodName]();
                expect(schema[method]).lastCalledWith(item);
                inputs.forEach(input => {
                    const calledWith = {};
                    calledWith[item] = (input.length > 1)
                        ? deep(input)
                        : deep(input[0]);

                    schema[methodName](...input);
                    expect(schema[method]).lastCalledWith(calledWith);
                });
            });
        });
    });
});
