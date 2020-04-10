const app = require('./_setup');
const request = require('supertest');

afterAll(() => app.close());

test(`Error handler when error`, () => {
  return request(app)
    .post('/global/handler')
    .send()
    .then(({ statusCode, body }) => {
      expect(statusCode).toBe(400);
      expect(body).toHaveProperty('isHandler', true);
      expect(body).toHaveProperty('error');
      expect(typeof body.error).toBe('string');
    });
});

test(`No error handler when no error`, () => {
  return request(app)
    .post('/global/handler')
    .send({ some: 1 })
    .then(({ statusCode, body }) => {
      expect(statusCode).toBe(200);
      expect(body).not.toHaveProperty('isHandler');
    });
});

test(`Options change from default`, async () => {
  await expect(
    request(app)
      .post('/global/options/pre')
      .send()
  ).resolves.toHaveProperty('statusCode', 200);
  await expect(
    request(app)
      .post('/global/options')
      .send()
  ).resolves.toHaveProperty('statusCode', 400);

  await expect(
    request(app)
      .post('/global/options')
      .send({ some: 1 })
  ).resolves.toHaveProperty('statusCode', 200);

  await expect(
    request(app)
      .post('/global/options')
      .set('some', '1')
      .send({ some: 1 })
  ).resolves.toHaveProperty('statusCode', 200);
});
