'use strict';
const id = (n) => `[${ String(n) }] `;

// Mocked
jest.mock('../../../lib/validation-schema/operations');
const operations = require('../../../lib/validation-schema/operations');

jest.mock('../../../lib/validation-schema/methods-getters');
const methodsGetters = require('../../../lib/validation-schema/methods-getters');
methodsGetters.mockImplementation((proto) => { proto.exProp = 1; });

jest.mock('../../../lib/checker');
const checker = require('../../../lib/checker');
checker.schema
    .mockImplementationOnce()
    .mockImplementationOnce(() => { throw Error(); })
    .mockImplementationOnce(() => { throw Error(); })
    .mockImplementationOnce(() => { throw Error(); })
    .mockImplementationOnce(() => { throw Error(); });

// Non Mocked
const ValidationSchema = require('../../../lib/validation-schema');

test(id(1) + `Aliases are added`, () => {
    expect(methodsGetters)
        .toBeCalledWith(ValidationSchema.prototype);
    expect(methodsGetters.mock.calls[0][0].constructor.name)
        .toBe('ValidationSchema');
    expect(ValidationSchema.prototype.exProp).toBe(1);
});

test(id(2) + `Calls schema checker (constructor, set schema, add, concat), throws if fail`, () => {
    const schema = new ValidationSchema(1);

    expect(() => new ValidationSchema(2)).toThrow();
    expect(() => { schema.schema = 3; }).toThrow();
    expect(() => schema.add(4)).toThrow();
    expect(() => schema.concat(5)).toThrow();
    expect(checker.schema.mock.calls)
        .toEqual([[1], [2], [3], [4], [5]]);

    checker.schema.mockClear();
    expect(() => new ValidationSchema(1)).not.toThrow();
    expect(() => { schema.schema = 2; }).not.toThrow();
    expect(() => schema.add(3)).not.toThrow();
    expect(() => schema.concat(4)).not.toThrow();
    expect(checker.schema.mock.calls)
        .toEqual([[1], [2], [3], [4]]);
});

describe(`- schema`, () => {
    test(id(1) + `get`, () => {
        const schema = (new ValidationSchema({
            body: { some: 1, else: 2 },
            headers: { some: 3, else: 4 }
        })).schema;

        expect(schema).toHaveProperty('body');
        expect(schema).toHaveProperty('headers');
        expect(schema.body).toHaveProperty('isJoi', true);
        expect(schema.headers).toHaveProperty('isJoi', true);
    });
    test(id(2) + `set`, () => {
        const validation = new ValidationSchema({
            body: { some: 1, else: 2 }
        });
        validation.schema = { headers: { some: 3, else: 4 } };
        const schema = validation.schema;

        expect(schema).not.toHaveProperty('body');
        expect(schema).toHaveProperty('headers');
        expect(schema.headers).toHaveProperty('isJoi', true);
    });
});

describe(`Methods taking standard key path`, () => {
    const exArgs = () => ([
        'body.c.b', 'body.a',
        { headers: ['c.a', 'a'] },
        'params.a'
    ]);
    const toTest = {
        before: ['use', 'skip'],
        after: ['required', 'optional', 'forbidden']
    };

    test(id(1) + `Call operation with arr of args`, () => {
        const schema = new ValidationSchema();
        Object.keys(toTest).forEach(key => {
            toTest[key].forEach(method => {
                operations[key][method].mockClear();

                schema[method](exArgs());
                expect(operations[key][method]).lastCalledWith([exArgs()]);

                schema[method](...exArgs());
                expect(operations[key][method]).lastCalledWith(exArgs());
            });
        });
    });
    test(id(2) + `Operation is not called when no arguments are passed to the method`, () => {
        const schema = new ValidationSchema();
        Object.keys(toTest).forEach(key => {
            toTest[key].forEach(method => {
                operations[key][method].mockClear();

                schema[method]();
                expect(operations[key][method]).not.toHaveBeenCalled();
            });
        });
    });
});

describe(`Methods taking schema (before)`, () => {
    const exArg = () => ({ body: { a: 1 }, headers: { b: 2 } });
    const toTest = ['add', 'concat'];

    test(id(1) + `Call operation with schema`, () => {
        const schema = new ValidationSchema();
        toTest.forEach(method => {
            operations.before[method].mockClear();

            schema[method](exArg());
            expect(operations.before[method]).lastCalledWith(exArg());
        });
    });
    test(id(2) + `Operation is not called when no arguments are passed to the method`, () => {
        const schema = new ValidationSchema();
        toTest.forEach(method => {
            operations.before[method].mockClear();

            schema[method]();
            expect(operations.before[method]).not.toHaveBeenCalled();
        });
    });
});
