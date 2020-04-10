const app = require('../_setup');
const request = require('supertest');

afterAll(() => app.close());

test(`Validation passes`, async () => {
  for (const url of ['/simple/query/base', '/simple/query/unbuilt']) {
    const { statusCode } = await request(app)
      .get(url + '?some=str&other=4')
      .send();
    expect(statusCode).toBe(200);
  }
});

test(`Validation fails`, async () => {
  for (const url of ['/simple/query/base', '/simple/query/unbuilt']) {
    const { statusCode } = await request(app)
      .get(url + '?some=str')
      .send();
    expect(statusCode).toBe(400);
  }
});

test(`Unknown keys are stripped`, async () => {
  for (const url of ['/simple/query/base', '/simple/query/unbuilt']) {
    const { body } = await request(app)
      .get(url + '?some=str&other=4&better=2&more=some')
      .send();
    expect(body.data.query).toEqual({ some: 'str', other: '4' });
  }
});

test(`Object mutates on pass`, () => {
  return request(app)
    .get('/simple/query/mutates?some=4')
    .send()
    .expect(200)
    .then(({ body }) => {
      expect(body.data.query).toHaveProperty('some', 4);
      expect(body.data.query).toHaveProperty('other', 'a default string');
    });
});
