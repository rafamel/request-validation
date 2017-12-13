'use strict';
const id = (n) => `[${ String(n) }] `;
const buildOptions = require('../../../lib/request-validation/build-options');
const clone = require('lodash.clone');
const config = require('../../../lib/config');

// Mocked
jest.mock('../../../lib/checker');
const checker = require('../../../lib/checker');

test(id(1) + `Passes first arg to checker.options`, () => {
    try { buildOptions({ ex: 1 }); } catch (e) { }
    expect(checker.options).toBeCalledWith({ ex: 1 });
});
test(id(2) + `Returns config.options for all as default`, () => {
    const built = buildOptions();
    config.req.forEach(item => {
        expect(built[item]).toEqual(config.options);
    });
});
test(id(3) + `Builds upon config.options, defaults, and specific`, () => {
    const built = buildOptions({
        defaults: { presence: 'forbidden' },
        body: { presence: 'required', other: 2 }
    });
    const result = clone(config.options);
    result.presence = 'forbidden';
    const resultBody = clone(config.options);
    resultBody.presence = 'required';
    resultBody.other = 2;

    expect(built).not.toHaveProperty('defaults');
    config.req.forEach(item => {
        if (item !== 'body') expect(built[item]).toEqual(result);
        else expect(built[item]).toEqual(resultBody);
    });
});
test(id(4) + `Builds upon second arg, defaults, and specific`, () => {
    const built = buildOptions(
        {
            defaults: { presence: 'forbidden' },
            headers: { presence: 'required', other: 2 }
        },
        { other: 5 }
    );
    const result = { other: 5, presence: 'forbidden' };
    const resultHeaders = clone(result);
    resultHeaders.presence = 'required';
    resultHeaders.other = 2;

    expect(built).not.toHaveProperty('defaults');
    config.req.forEach(item => {
        if (item !== 'headers') expect(built[item]).toEqual(result);
        else expect(built[item]).toEqual(resultHeaders);
    });
});
