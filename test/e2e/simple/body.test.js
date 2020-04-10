const app = require('../_setup');
const request = require('supertest');

afterAll(() => app.close());

test(`Validation passes`, async () => {
  for (const url of ['/simple/body/base', '/simple/body/unbuilt']) {
    const { statusCode } = await request(app)
      .post(url)
      .send({ some: 'str', other: 4 });
    expect(statusCode).toBe(200);
  }
});

test(`Validation fails`, async () => {
  for (const url of ['/simple/body/base', '/simple/body/unbuilt']) {
    const { statusCode } = await request(app)
      .post(url)
      .send({ some: 'str' });
    expect(statusCode).toBe(400);
  }
});

test(`Unknown keys are stripped`, async () => {
  for (const url of ['/simple/body/base', '/simple/body/unbuilt']) {
    const { body } = await request(app)
      .post(url)
      .send({
        some: 'str',
        other: 4,
        better: 2,
        more: 'some'
      });
    expect(body.data.body).toEqual({ some: 'str', other: 4 });
  }
});

test(`Object mutates on pass`, () => {
  return request(app)
    .post('/simple/body/mutates')
    .send({ some: '4' })
    .expect(200)
    .then(({ body }) => {
      expect(body.data.body).toHaveProperty('some', 4);
      expect(body.data.body).toHaveProperty('other', 'a default string');
    });
});
