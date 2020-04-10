const app = require('../_setup');
const request = require('supertest');

afterAll(() => app.close());

test(`Validation passes`, async () => {
  for (const url of ['/simple/cookies/base', '/simple/cookies/unbuilt']) {
    const { statusCode } = await request(app)
      .get(url)
      .set('Cookie', 'some=str; other=4')
      .send();
    expect(statusCode).toBe(200);
  }
});

test(`Validation fails`, async () => {
  for (const url of ['/simple/cookies/base', '/simple/cookies/unbuilt']) {
    const { statusCode } = await request(app)
      .get(url)
      .set('Cookie', 'some=str; other=5')
      .send();
    expect(statusCode).toBe(400);
  }
});

test(`Unknown keys are stripped`, async () => {
  for (const url of ['/simple/cookies/base', '/simple/cookies/unbuilt']) {
    const { body } = await request(app)
      .get(url)
      .set('Cookie', 'some=str; other=4; better=2; more=some;')
      .send();
    expect(body.data.cookies).toEqual({ some: 'str', other: '4' });
  }
});

test(`Object mutates on pass`, () => {
  return request(app)
    .get('/simple/cookies/mutates')
    .set('Cookie', 'some=4;')
    .expect(200)
    .then(({ body }) => {
      expect(body.data.cookies).toHaveProperty('some', 4);
      expect(body.data.cookies).toHaveProperty('other', 'a default string');
    });
});
