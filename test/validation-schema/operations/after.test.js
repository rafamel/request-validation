'use strict';
const { mockPresenceKeys } = require('../_setup/joi.mock');
const Joi = require('joi');
const { after } = require('../../../lib/validation-schema/operations');

const id = (n) => `[${ String(n) }] `;

const exBuilt = () => {
    return {
        keys: ['body.some.other', 'body.some.other.more', 'body.some.else', 'body.other', 'headers.some.other', 'headers.some.else', 'headers.other'],
        schema: {
            body: Joi.object(),
            headers: Joi.object()
        }
    };
};

describe(`- required, optional, forbidden`, () => {
    const all = ['required', 'optional', 'forbidden'];

    test(id(1) + `Throws on non existent parent key`, () => {
        const { schema, keys } = exBuilt();
        keys.push('some.more');
        all.forEach(type => {
            expect(() => after[type](keys)(schema)).toThrow();
        });
    });
    test(id(2), () => {
        const result = {
            body: ['some.other', 'some.other.more', 'some.else', 'other'],
            headers: ['some.other', 'some.else', 'other']
        };

        all.forEach(type => {
            const { schema, keys } = exBuilt();
            after[type](keys)(schema);
            ['headers', 'body'].forEach(key => {
                expect(mockPresenceKeys).toBeCalledWith(type, result[key]);
                expect(schema[key]).toHaveProperty('presenceKeys');
                expect(schema[key].presenceKeys[type]).toEqual(result[key]);
            });
        });
    });
});
