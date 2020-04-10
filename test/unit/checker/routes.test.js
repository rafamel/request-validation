const checker = require('../../../src/checker');

// Mocked
const Joi = require('joi');
jest.spyOn(Joi, 'any');
Joi.any.mockImplementation(() => ({ isJoi: true }));

jest.mock('../../../src/validation-schema');
const ValidationSchema = require('../../../src/validation-schema');

jest
  .spyOn(checker, 'schema')
  .mockImplementation()
  .mockImplementationOnce(() => {
    throw Error();
  });

test(`Passes for ValidationSchema`, () => {
  const input = {
    some: new ValidationSchema(),
    other: new ValidationSchema(),
    route: new ValidationSchema()
  };

  expect(() => checker.routes(input)).not.toThrow();
  expect(checker.schema).not.toHaveBeenCalled();
});

test(`Calls schema and throws when schema throws`, () => {
  const input = { some: 5 };

  expect(() => checker.routes(input)).toThrow();
  expect(checker.schema).toHaveBeenCalledTimes(1);
});

test(`Calls schema checker for non ValidationSchema`, () => {
  const tests = [
    {
      input: {
        some: 5,
        other: {},
        route: new ValidationSchema(),
        even: null,
        more: undefined,
        and: new ValidationSchema(),
        much: 'more'
      },
      calls: [5, {}, null, undefined, 'more']
    },
    {
      input: {
        some: { query: { a: Joi.any(), b: Joi.any() } },
        other: { body: Joi.any() },
        route: new ValidationSchema()
      },
      calls: [{ query: { a: Joi.any(), b: Joi.any() } }, { body: Joi.any() }]
    }
  ];

  checker.schema.mockClear();
  tests.forEach(({ input, calls }) => {
    checker.routes(input);
    calls.forEach((call) => {
      expect(checker.schema).toBeCalledWith(call);
    });
  });
});
