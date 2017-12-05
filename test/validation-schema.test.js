'use strict';
const Joi = require('joi');
const ValidationSchema = require('../lib/validation-schema');

const id = (n) => `[${ String(n) }] `;

describe(`- ValidationSchema`, () => {
    describe(`- Basics`, () => {
        test(id(1) + `Takes right input`, () => {
            const schema = {
                some: Joi.any(),
                other: Joi.any()
            };
            expect(() => new ValidationSchema(schema)).not.toThrow();
        });
        test(id(2) + `Doesn't take wrong input`, () => {
            const schema = {
                some: {},
                other: Joi.any()
            };
            expect(() => new ValidationSchema(schema)).toThrow();
        });
        test(id(3) + `Inherits keys`, () => {
            const schema = new ValidationSchema({
                some: Joi.any(),
                other: Joi.any()
            });
            expect(schema).toHaveProperty('some');
            expect(schema.some).toHaveProperty('isJoi', true);
            expect(schema).toHaveProperty('other');
            expect(schema.other).toHaveProperty('isJoi', true);
        });
    });
    describe(`- .use()`, () => {
        const schema = new ValidationSchema({
            some: Joi.any(),
            other: Joi.any(),
            more: Joi.any()
        });
        test(id(1) + `Takes right input`, () => {
            expect(() => schema.use(['some', 'other'])).not.toThrow();
        });
        test(id(2) + `Doesn't takes wrong input`, () => {
            expect(() => schema.use(['some', 'a'])).toThrow();
            expect(() => schema.use(1)).toThrow();
            expect(() => schema.use([1, '1'])).toThrow();
        });
        test(id(3) + `Works and doesn't mutate original schema`, () => {
            const a = schema.use(['some']);
            const b = schema.use(['some', 'other']);
            const c = schema.use(['other', 'more']);

            expect(Object.keys(a)).toEqual(['some']);
            expect(Object.keys(b)).toEqual(['some', 'other']);
            expect(Object.keys(c)).toEqual(['other', 'more']);
        });
    });
    describe(`- .joi()`, () => {
        test(id(1), () => {
            const schema = (new ValidationSchema({
                more: Joi.any()
            })).joi();

            expect(schema).toHaveProperty('isJoi', true);
            expect(() => schema.keys({ add: Joi.any() })).not.toThrow();
        });
    });
});
