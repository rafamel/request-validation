'use strict';
const id = (n) => `[${ String(n) }] `;
const checker = require('../../lib/checker');
jest.mock('../../lib/validation-schema');
const ValidationSchema = require('../../lib/validation-schema');

const exJoi = { isJoi: true };
const exValidationSchema = new ValidationSchema();

describe(`- routes`, () => {
    test(id(1) + `Passes for ValidationSchema`, () => {
        const input = {
            some: exValidationSchema,
            other: exValidationSchema,
            route: exValidationSchema
        };

        expect(() => checker.routes(input)).not.toThrow();
    });
    test(id(2) + `Calls schema checker for any other`, () => {
        const tests = [{
            input: {
                some: 5,
                other: {},
                route: exValidationSchema,
                even: null,
                more: undefined,
                and: exValidationSchema,
                much: 'more'
            },
            pass: false,
            calls: [5, {}, null, undefined, 'more']
        }, {
            input: {
                some: { query: { a: exJoi, b: exJoi } },
                other: { body: exJoi },
                route: exValidationSchema
            },
            pass: true,
            calls: [{ query: { a: exJoi, b: exJoi } }, { body: exJoi }]
        }];

        tests.forEach(({ input, pass, calls }) => {
            jest.spyOn(checker, 'schema').mockImplementation();
            checker.routes(input);
            calls.forEach(call => {
                expect(checker.schema).toBeCalledWith(call);
            });

            checker.schema.mockRestore();
            if (pass) expect(() => checker.routes(input)).not.toThrow();
            else expect(() => checker.routes(input)).toThrow();
        });
    });
});
describe(`- schema`, () => {
    test(id(1) + `Fails for wrong input`, () => {
        const input = [
            undefined,
            null,
            '',
            5,
            false,
            true,
            {},
            { some: {} },
            { some: exJoi },
            { defaults: {} },
            { defaults: exJoi },
            { body: {}, defaults: {} },
            { body: exJoi, defaults: exJoi },
            { body: 5 },
            { body: undefined },
            { body: null },
            { body: '' },
            { body: 'some' },
            { body: { some: 5 } },
            { body: { some: undefined } },
            { body: { some: null } },
            { body: { some: '' } },
            { body: { some: 'some' } }
        ];

        input.forEach(item => {
            expect(() => checker.schema(item)).toThrow();
        });
    });
    test(id(2) + `Passes for correct input`, () => {
        const input = [{
            headers: exJoi,
            body: exJoi,
            query: exJoi,
            params: exJoi,
            cookies: exJoi
        }, {
            headers: exJoi,
            body: exJoi
        }, {
            headers: { some: exJoi, other: exJoi },
            body: { some: exJoi, other: exJoi },
            query: { some: exJoi, other: exJoi },
            params: { some: exJoi, other: exJoi },
            cookies: { some: exJoi, other: exJoi }
        }, {
            params: { some: exJoi, other: exJoi },
            cookies: { some: exJoi, other: exJoi }
        }, {
            headers: { some: exJoi, other: exJoi },
            body: { some: exJoi, other: exJoi }
        }, {
            headers: { some: exJoi, other: exJoi }
        }, {
            body: { some: exJoi, other: exJoi }
        }];

        input.forEach(item => {
            expect(() => checker.schema(item)).not.toThrow();
        });
    });
});
describe(`- presence`, () => {
    test(id(1) + `Fails for wrong input`, () => {
        const input = [
            undefined,
            null,
            5,
            false,
            true,
            '',
            'somestr',
            { some: 'required' },
            { body: { body: 'required' } }
        ];

        input.forEach(item => {
            expect(() => checker.presence(item)).toThrow();
        });
    });
    test(id(2) + `Passes for correct input`, () => {
        const input = [
            'required',
            'optional',
            'forbidden',
            { defaults: 'required' },
            { body: 'optional' },
            { headers: 'forbidden', body: 'required' },
            { cookies: 'forbidden', params: 'required' },
            { defaults: 'optional', headers: 'forbidden', body: 'required' },
            { defaults: 'required', cookies: 'forbidden', params: 'required' },
            {
                defaults: 'forbidden',
                headers: 'required',
                body: 'optional',
                query: 'forbidden',
                params: 'required',
                cookies: 'optional'
            }
        ];

        input.forEach(item => {
            expect(() => checker.presence(item)).not.toThrow();
        });
    });
});
describe(`- options`, () => {
    test(id(1) + `Fails for wrong input`, () => {
        const input = [
            undefined,
            null,
            '',
            5,
            false,
            true,
            { some: {} },
            { body: {}, some: {} },
            { defaults: {}, some: {} }
        ];

        input.forEach(item => {
            expect(() => checker.options(item)).toThrow();
        });
    });
    test(id(2) + `Passes for correct input`, () => {
        const input = [{
            defaults: {},
            headers: { some: 5 },
            body: {},
            query: { some: 5 },
            params: {},
            cookies: { some: 5 }
        }, {
            defaults: {},
            headers: { some: 5 },
            body: {},
            query: { some: 5 }
        }, {
            headers: { some: 5 },
            body: {},
            query: { some: 5 }
        }, {
            defaults: { some: 5 }
        }, {
            body: {}
        }];

        input.forEach(item => {
            expect(() => checker.options(item)).not.toThrow();
        });
    });
});
