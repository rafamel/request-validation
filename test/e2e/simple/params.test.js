const app = require('../_setup');
const request = require('supertest');

afterAll(() => app.close());

test(`Validation passes`, async () => {
  for (const url of ['/simple/params/base', '/simple/params/unbuilt']) {
    const { statusCode } = await request(app)
      .get(url + '/4')
      .send();
    expect(statusCode).toBe(200);
  }
});

test(`Validation fails`, async () => {
  for (const url of ['/simple/params/base', '/simple/params/unbuilt']) {
    const { statusCode } = await request(app)
      .get(url + '/5')
      .send();
    expect(statusCode).toBe(400);
  }
});

test(`Object mutates on pass`, () => {
  return request(app)
    .get('/simple/params/mutates/4')
    .send()
    .expect(200)
    .then(({ body }) => {
      expect(body.data.params).toHaveProperty('some', 4);
      expect(body.data.params).toHaveProperty('other', 'a default string');
    });
});
