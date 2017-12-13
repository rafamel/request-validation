'use strict';
const id = (n) => `[${ String(n) }] `;
const validateRequest = require('../../../lib/request-validation/validate-request');

// Mocked
jest.mock('joi');
const Joi = require('joi');
Joi.validate.mockImplementation((...args) => {
    if (args[2] === 'error') throw Error();
    return (args[2] === 'fail')
        ? ({ error: Error(), value: { some: 1, other: 2 } })
        : ({ error: null, value: { some: 1, other: 2 } });
});

// Data
const exData = () => ({
    toValidate: { a: 1, b: 2, c: 3, d: 4 },
    options: { a: 5, b: 6, c: 7, d: 8 },
    failOptions: { a: 'fail', b: 'fail', c: 'fail', d: 'fail' },
    errorOptions: { a: 'error', b: 'error', c: 'error', d: 'error' },
    req: { a: 9, b: 10, c: 11, d: 12 },
    res: 'ex',
    next: jest.fn(),
    handler: jest.fn()
});

test(`- ValidateRequest returns a function`, () => {
    expect(typeof validateRequest()).toBe('function');
});

test(`- Doesn't fail on inexistent req key`, () => {
    const [t, data] = [exData(), exData()];
    Joi.validate.mockClear();
    validateRequest(t.toValidate, t.options)({}, {}, t.next);

    Object.keys(data.toValidate).forEach(key => {
        expect(Joi.validate).toHaveBeenCalledWith(
            {},
            data.toValidate[key],
            data.options[key]
        );
    });
});

describe(`- No handler`, () => {
    describe(`- On Pass`, () => {
        test(id(1) + `Validates each`, () => {
            const [t, data] = [exData(), exData()];
            Joi.validate.mockClear();
            validateRequest(t.toValidate, t.options)(t.req, t.res, t.next);

            expect(Joi.validate.mock.calls.length).toBe(4);
            Object.keys(data.toValidate).forEach(key => {
                expect(Joi.validate).toHaveBeenCalledWith(
                    data.req[key],
                    data.toValidate[key],
                    data.options[key]
                );
            });
        });
        test(id(2) + `Modifies req values`, () => {
            const [t, data] = [exData(), exData()];
            validateRequest(t.toValidate, t.options)(t.req, t.res, t.next);

            Object.keys(data.toValidate).forEach(key => {
                expect(t.req[key]).toEqual({ some: 1, other: 2 });
            });
        });
        test(id(3) + `Empty next`, () => {
            const t = exData();
            validateRequest(t.toValidate, t.options)(t.req, t.res, t.next);

            expect(t.next.mock.calls).toEqual([[]]);
        });
    });
    describe(`- On Fail`, () => {
        test(id(1) + `Aborts early`, () => {
            const t = exData();
            Joi.validate.mockClear();
            validateRequest(t.toValidate, t.failOptions)(t.req, t.res, t.next);

            expect(Joi.validate).toHaveBeenCalledTimes(1);
        });
        test(id(2) + `Does not change req values (after fail)`, () => {
            const [t, data] = [exData(), exData()];
            validateRequest(t.toValidate, t.failOptions)(t.req, t.res, t.next);

            Object.keys(data.toValidate).forEach(key => {
                expect(t.req[key]).not.toEqual({ some: 1, other: 2 });
            });
        });
        test(id(3) + `Calls next with error .isRequestValidation = true`, () => {
            const t = exData();
            validateRequest(t.toValidate, t.failOptions)(t.req, t.res, t.next);

            expect(t.next).toHaveBeenCalledTimes(1);
            expect(t.next.mock.calls[0][0]).toBeInstanceOf(Error);
            expect(t.next.mock.calls[0][0])
                .toHaveProperty('isRequestValidation', true);
        });
        test(id(3) + `Calls next with error if exception happens`, () => {
            const t = exData();
            validateRequest(t.toValidate, t.errorOptions)(t.req, t.res, t.next);

            expect(t.next)
                .toHaveBeenCalledTimes(1);
            expect(t.next.mock.calls[0][0])
                .toBeInstanceOf(Error);
            expect(t.next.mock.calls[0][0])
                .not.toHaveProperty('isRequestValidation');
        });
    });
});

describe(`- Handler`, () => {
    describe(`- On Pass`, () => {
        test(id(1) + `Empty next, does not call handler`, () => {
            const t = exData();
            validateRequest(t.toValidate, t.options, t.handler)(
                t.req, t.res, t.next
            );

            expect(t.next.mock.calls).toEqual([[]]);
            expect(t.next).toHaveBeenCalledTimes(1);
            expect(t.handler).not.toHaveBeenCalled();
        });
    });
    describe(`- On Fail`, () => {
        test(id(1) + `Calls handler with error .isRequestValidation = true`, () => {
            const t = exData();
            validateRequest(t.toValidate, t.failOptions, t.handler)(
                t.req, t.res, t.next
            );

            expect(t.next).not.toHaveBeenCalled();
            expect(t.handler)
                .toHaveBeenCalledTimes(1);
            expect(t.handler)
                .toHaveBeenCalledWith(Error(), t.req, t.res, t.next);
            expect(t.handler.mock.calls[0][0])
                .toHaveProperty('isRequestValidation', true);
        });
        test(id(2) + `Calls handler with error if exception happens`, () => {
            const t = exData();
            validateRequest(t.toValidate, t.errorOptions, t.handler)(
                t.req, t.res, t.next
            );

            expect(t.next)
                .not.toHaveBeenCalled();
            expect(t.handler)
                .toHaveBeenCalledTimes(1);
            expect(t.handler)
                .toHaveBeenCalledWith(Error(), t.req, t.res, t.next);
            expect(t.handler.mock.calls[0][0])
                .not.toHaveProperty('isRequestValidation');
        });
    });
});
