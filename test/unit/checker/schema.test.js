'use strict';
const id = (n) => `[${ String(n) }] `;
const checker = require('../../../lib/checker');

// Mocked
const Joi = require('joi');
jest.spyOn(Joi, 'any');
Joi.any.mockImplementation(() => ({ isJoi: true }));

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
        { some: Joi.any() },
        { defaults: {} },
        { defaults: Joi.any() },
        { body: {}, defaults: {} },
        { body: Joi.any(), defaults: Joi.any() },
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
        headers: Joi.any(),
        body: Joi.any(),
        query: Joi.any(),
        params: Joi.any(),
        cookies: Joi.any()
    }, {
        headers: Joi.any(),
        body: Joi.any()
    }, {
        headers: { some: Joi.any(), other: Joi.any() },
        body: { some: Joi.any(), other: Joi.any() },
        query: { some: Joi.any(), other: Joi.any() },
        params: { some: Joi.any(), other: Joi.any() },
        cookies: { some: Joi.any(), other: Joi.any() }
    }, {
        params: { some: Joi.any(), other: Joi.any() },
        cookies: { some: Joi.any(), other: Joi.any() }
    }, {
        headers: { some: Joi.any(), other: Joi.any() },
        body: { some: Joi.any(), other: Joi.any() }
    }, {
        headers: { some: Joi.any(), other: Joi.any() }
    }, {
        body: { some: Joi.any(), other: Joi.any() }
    }];

    input.forEach(item => {
        expect(() => checker.schema(item)).not.toThrow();
    });
});
