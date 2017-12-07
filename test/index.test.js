'use strict';
const Joi = require('joi');
const RequestValidation = require('../lib');

const id = (n) => `[${ String(n) }] `;

describe(`- Is safe`, () => {
    test(id(1) + `Takes right input`, () => {
        const schema = { someKey: Joi.any() };
        const routesA = { someRoute: { headers: Joi.any() } };
        const routesB = () => routesA;
        const options = {};

        expect(() => RequestValidation({ schema }))
            .not.toThrow();
        expect(() => RequestValidation({ routes: routesA }))
            .not.toThrow();
        expect(() => RequestValidation({ routes: routesB }))
            .not.toThrow();
        expect(() => RequestValidation({ options }))
            .not.toThrow();
        expect(() => RequestValidation({ schema, routes: routesA }))
            .not.toThrow();
        expect(() => RequestValidation({ schema, routes: routesA, options }))
            .not.toThrow();
        expect(() => RequestValidation({ routes: routesA }))
            .not.toThrow();
        expect(() => RequestValidation({ routes: routesA, options }))
            .not.toThrow();
    });
    test(id(2) + `Rejects wrong input`, () => {
        expect(() => RequestValidation(5))
            .toThrow();
        expect(() => RequestValidation('some'))
            .toThrow();
        expect(() => RequestValidation({ schema: 5 }))
            .toThrow();
        expect(() => RequestValidation({ schema: 'some' }))
            .toThrow();
        expect(() => RequestValidation({
            routes: { schema: { headers: Joi.any() } }
        })).toThrow();
        expect(() => RequestValidation({ routes:
            { someRoute: { other: Joi.any() } }
        })).toThrow();
        expect(() => RequestValidation(() => ({ routes:
            { someRoute: { other: Joi.any() } }
        }))).toThrow();
        expect(() => RequestValidation({ options: 5 }))
            .toThrow();
        expect(() => RequestValidation({ options: 'some' }))
            .toThrow();
    });
});
