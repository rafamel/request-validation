const checker = require('../../../src/checker');

test(`Fails for wrong input`, () => {
  const input = [
    undefined,
    null,
    5,
    false,
    true,
    '',
    'somestr',
    { some: 'required' },
    { body: { body: 'required' } }
  ];

  input.forEach((item) => {
    expect(() => checker.presence(item)).toThrow();
  });
});
test(`Passes for correct input`, () => {
  const input = [
    'required',
    'optional',
    'forbidden',
    { defaults: 'required' },
    { body: 'optional' },
    { headers: 'forbidden', body: 'required' },
    { cookies: 'forbidden', params: 'required' },
    { defaults: 'optional', headers: 'forbidden', body: 'required' },
    { defaults: 'required', cookies: 'forbidden', params: 'required' },
    {
      defaults: 'forbidden',
      headers: 'required',
      body: 'optional',
      query: 'forbidden',
      params: 'required',
      cookies: 'optional'
    }
  ];

  input.forEach((item) => {
    expect(() => checker.presence(item)).not.toThrow();
  });
});
