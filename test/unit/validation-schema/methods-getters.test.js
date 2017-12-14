'use strict';
const id = (n) => `[${ String(n) }] `;
const config = require('../../../lib/config');
const deep = require('lodash.clonedeep');
const methodsGetters = require('../../../lib/validation-schema/methods-getters');

// Mocked
jest.mock('joi');
const Joi = require('joi');
Joi.any.mockImplementation(() => ({ isJoi: true }));

jest.mock('../../../lib/validation-schema');
const ValidationSchema = require('../../../lib/validation-schema');
const ans = {};
config.req.forEach((item) => { ans[item] = item; });
const schemaMock = jest.fn().mockImplementation(() => ans);
ValidationSchema.prototype.__defineGetter__('schema', schemaMock);
methodsGetters(ValidationSchema.prototype);

test(id(1) + `Method aliases are added`, () => {
    const instance = new ValidationSchema();
    const inputs = [
        [null],
        [undefined],
        [5],
        [{}],
        [{ some: {} }],
        [{ body: { key: Joi.any() } }],
        [{ some: { a: Joi.any() } }],
        [{ some: { a: Joi.any() } }, { body: { key: Joi.any() } }, null, undefined]
    ];

    const all = ['use', 'skip', 'add', 'concat', 'required',
        'optional', 'forbidden', 'options', 'presence'];
    all.forEach(method => {
        config.req.forEach(item => {
            const methodName = method + item[0].toUpperCase() + item.slice(1);

            expect(typeof instance[methodName]).toBe('function');

            instance[methodName]();
            expect(ValidationSchema.prototype[method])
                .lastCalledWith(item);

            inputs.forEach(input => {
                const calledWith = {};
                calledWith[item] = (input.length > 1)
                    ? deep(input)
                    : deep(input[0]);

                instance[methodName](...input);
                expect(ValidationSchema.prototype[method])
                    .lastCalledWith(calledWith);
            });
        });
    });
});

test(id(2) + `Property aliases are added`, () => {
    const instance = new ValidationSchema();
    config.req.forEach(item => {
        schemaMock.mockClear();

        expect(instance[item]).toEqual(item);
        expect(instance[item]).toEqual(instance.schema[item]);
        expect(schemaMock).toHaveBeenCalledTimes(3);
    });
});
