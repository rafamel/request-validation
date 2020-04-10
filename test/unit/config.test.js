const config = require('../../src/config');

test(`moduleName`, () => {
  expect(config.moduleName).toBe('request-validation');
});
test(`options`, () => {
  expect(config.options).toEqual({
    abortEarly: true,
    convert: false,
    stripUnknown: true,
    presence: 'optional'
  });
});
test(`req`, () => {
  expect(config.req).toEqual(['headers', 'body', 'query', 'params', 'cookies']);
});
test(`reqRegexp`, () => {
  const reqRegexp = config.reqRegexp;

  expect(reqRegexp.all).toBeInstanceOf(RegExp);
  expect(reqRegexp.defaults).toBeInstanceOf(RegExp);
  expect(reqRegexp.all.toString()).toBe(
    '/^(headers|body|query|params|cookies)$/'
  );
  expect(reqRegexp.defaults.toString()).toBe(
    '/^(defaults|headers|body|query|params|cookies)$/'
  );
});
