const checker = require('../../../src/checker');

test(`Fails for wrong input`, () => {
  const input = [
    undefined,
    null,
    '',
    5,
    false,
    true,
    { some: {} },
    { body: {}, some: {} },
    { defaults: {}, some: {} }
  ];

  input.forEach((item) => {
    expect(() => checker.options(item)).toThrow();
  });
});

test(`Passes for correct input`, () => {
  const input = [
    {
      defaults: {},
      headers: { some: 5 },
      body: {},
      query: { some: 5 },
      params: {},
      cookies: { some: 5 }
    },
    {
      defaults: {},
      headers: { some: 5 },
      body: {},
      query: { some: 5 }
    },
    {
      headers: { some: 5 },
      body: {},
      query: { some: 5 }
    },
    {
      defaults: { some: 5 }
    },
    {
      body: {}
    }
  ];

  input.forEach((item) => {
    expect(() => checker.options(item)).not.toThrow();
  });
});
