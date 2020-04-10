const {
  RequestValidation,
  options,
  handler
} = require('../../../src/request-validation/');

// Mocked
jest.mock('../../../src/checker');
const checker = require('../../../src/checker');
checker.routes.mockImplementationOnce(() => {
  throw Error();
});

jest.mock('../../../src/request-validation/build-options');
const buildOptions = require('../../../src/request-validation/build-options');
buildOptions.mockImplementation((obj) => obj || {});

jest.mock('../../../src/validation-schema');
const ValidationSchema = require('../../../src/validation-schema');
ValidationSchema.mockImplementation(function(input) {
  this.schema = input;
});

jest.mock('../../../src/request-validation/validate-request');
const validateRequest = require('../../../src/request-validation/validate-request');
validateRequest.mockImplementation((i) => ({ vr: i }));

describe(`RequestValidation`, () => {
  test(`Checks routes and throws when fail`, () => {
    expect(() => new RequestValidation('ex')).toThrow();
    expect(() => new RequestValidation('ex2')).not.toThrow();
    expect(checker.routes).toHaveBeenCalledTimes(2);
    expect(checker.routes).toHaveBeenCalledWith('ex');
    expect(checker.routes).toHaveBeenCalledWith('ex2');
  });
  test(`A validation schema is built for each route`, () => {
    const routes = { a: 1, b: 2, c: new ValidationSchema(3) };
    ValidationSchema.mockClear();
    validateRequest.mockClear();
    const rv = new RequestValidation(routes);

    expect(ValidationSchema).toHaveBeenCalledTimes(2);
    expect(ValidationSchema).toHaveBeenCalledWith(1);
    expect(ValidationSchema).toHaveBeenCalledWith(2);
    expect(validateRequest).toHaveBeenCalledTimes(3);
    const firstArgs = validateRequest.mock.calls.map((x) => x[0]);
    expect(firstArgs).toContain(1);
    expect(firstArgs).toContain(2);
    expect(firstArgs).toContain(3);
    expect(rv).toHaveProperty('a', { vr: 1 });
    expect(rv).toHaveProperty('b', { vr: 2 });
    expect(rv).toHaveProperty('c', { vr: 3 });
  });
  test(`Global options`, () => {
    validateRequest.mockClear();
    options({ some: 1, other: 2 });
    // eslint-disable-next-line
    new RequestValidation({ a: 1, b: 2, c: 3 });

    const secondArgs = validateRequest.mock.calls.map((x) => x[1]);
    secondArgs.forEach((item) => {
      expect(item).toEqual({ some: 1, other: 2 });
    });
  });
  test(`Instance options`, () => {
    validateRequest.mockClear();
    // eslint-disable-next-line
    new RequestValidation({ a: 1, b: 2, c: 3 }, { some: 3, more: 4 });

    const secondArgs = validateRequest.mock.calls.map((x) => x[1]);
    secondArgs.forEach((item) => {
      expect(item).toEqual({ some: 3, other: 2, more: 4 });
    });
  });
  test(`Global handler`, () => {
    validateRequest.mockClear();
    handler({ thisIsHandler: true });
    // eslint-disable-next-line
    new RequestValidation({ a: 1, b: 2, c: 3 });

    const ThirdArgs = validateRequest.mock.calls.map((x) => x[2]);
    ThirdArgs.forEach((item) => {
      expect(item).toEqual({ thisIsHandler: true });
    });
  });
});
