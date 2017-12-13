'use strict';
const id = (n) => `[${ String(n) }] `;
const config = require('../../lib/config');

test(id(1) + `moduleName`, () => {
    expect(config.moduleName).toBe('request-validation');
});
test(id(2) + `options`, () => {
    expect(config.options).toEqual({
        abortEarly: true,
        convert: false,
        stripUnknown: true,
        presence: 'optional'
    });
});
test(id(3) + `req`, () => {
    expect(config.req)
        .toEqual(['headers', 'body', 'query', 'params', 'cookies']);
});
test(id(4) + `reqRegexp`, () => {
    const reqRegexp = config.reqRegexp;

    expect(reqRegexp.all).toBeInstanceOf(RegExp);
    expect(reqRegexp.defaults).toBeInstanceOf(RegExp);
    expect(reqRegexp.all.toString())
        .toBe('/^(headers|body|query|params|cookies)$/');
    expect(reqRegexp.defaults.toString())
        .toBe('/^(defaults|headers|body|query|params|cookies)$/');
});
