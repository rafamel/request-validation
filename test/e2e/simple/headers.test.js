const app = require('../_setup');
const request = require('supertest');

afterAll(() => app.close());

test(`Validation passes`, async () => {
  for (const url of ['/simple/headers/base', '/simple/headers/unbuilt']) {
    const { statusCode } = await request(app)
      .get(url)
      .set('some', 'str')
      .set('other', '4')
      .send();
    expect(statusCode).toBe(200);
  }
});

test(`Validation fails`, async () => {
  for (const url of ['/simple/cookies/base', '/simple/cookies/unbuilt']) {
    const { statusCode } = await request(app)
      .get(url)
      .set('some', 'str')
      .set('other', '5')
      .send();
    expect(statusCode).toBe(400);
  }
});

test(`Unknown keys are stripped`, async () => {
  for (const url of ['/simple/headers/base', '/simple/headers/unbuilt']) {
    const { body } = await request(app)
      .get(url)
      .set('some', 'str')
      .set('other', '4')
      .set('better', '2')
      .set('more', 'some')
      .send();
    expect(body.data.headers).toEqual({ some: 'str', other: '4' });
  }
});

test(`Object mutates on pass`, () => {
  return request(app)
    .get('/simple/headers/mutates')
    .set('some', '4')
    .expect(200)
    .then(({ body }) => {
      expect(body.data.headers).toHaveProperty('some', 4);
      expect(body.data.headers).toHaveProperty('other', 'a default string');
    });
});
