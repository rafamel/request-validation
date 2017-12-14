'use strict';
const id = (n) => `[${ String(n) }] `;
const after = require('../../../../lib/validation-schema/operations/after');

// Mocks
jest.mock('../../../../lib/validation-schema/operations/parse-input');
const { stringPaths } = require('../../../../lib/validation-schema/operations/parse-input');
stringPaths
    .mockImplementation((x) => x)
    .mockImplementationOnce(() => { throw Error(); })
    .mockImplementationOnce(() => { throw Error(); })
    .mockImplementationOnce(() => { throw Error(); });

const toTest = ['required', 'optional', 'forbidden'];

test(id(1) + `Throws on stringPaths throw, passes args to stringPaths`, () => {
    const input = 'someinput';

    toTest.forEach(item => {
        expect(() => after[item](input)).toThrow();
    });
    expect(stringPaths).toHaveBeenCalledTimes(3);

    stringPaths.mockClear();
    toTest.forEach(item => {
        expect(() => after[item](input)).not.toThrow();
        expect(typeof after[item](input)).toBe('function');
        expect(stringPaths).lastCalledWith(input);
    });
    expect(stringPaths).toHaveBeenCalledTimes(6);
});

test(id(2) + `Each applies proper Joi method`, () => {
    const mocks = {
        requiredKeys: jest.fn((x) => [x, 'required']),
        optionalKeys: jest.fn((x) => [x, 'optional']),
        forbiddenKeys: jest.fn((x) => [x, 'forbidden'])
    };
    const stringPaths = {
        body: 4,
        headers: 5
    };
    const exSchema = () => ({
        body: mocks,
        headers: mocks
    });

    toTest.forEach(item => {
        Object.keys(mocks).forEach(key => { mocks[key].mockClear(); });
        const schema = exSchema();
        after[item](stringPaths)(schema);

        expect(schema.body).toEqual([4, item]);
        expect(schema.headers).toEqual([5, item]);
        expect(mocks[`${item}Keys`]).toHaveBeenCalled();
    });
});

test(id(3) + `Inner function throws when key doesn't exist`, () => {
    const dummies = {
        requiredKeys: () => {},
        optionalKeys: () => {},
        forbiddenKeys: () => {}
    };

    toTest.forEach(item => {
        expect(() => after[item]({ body: 1 })({ body: dummies })).not.toThrow();
        expect(() => after[item]({ body: 1 })({ headers: dummies })).toThrow();
    });
});
