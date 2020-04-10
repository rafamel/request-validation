const app = require('./_setup');
const request = require('supertest');

afterAll(() => app.close());

test(`allOptional`, async () => {
  await expect(
    request(app)
      .post('/rv/allOptional')
      .send()
  ).resolves.toHaveProperty('statusCode', 200);
});

test(`defaultOptional`, async () => {
  await expect(
    request(app)
      .post('/rv/defaultsOptional')
      .send()
  ).resolves.toHaveProperty('statusCode', 400);
  await expect(
    request(app)
      .post('/rv/defaultsOptional')
      .set('Cookie', 'aCookie=str;')
      .send()
  ).resolves.toHaveProperty('statusCode', 200);
});

test(`ineritedDefaults`, async () => {
  await expect(
    request(app)
      .post('/rv/ineritedDefaults')
      .set('Cookie', 'aCookie=str;')
      .send()
  ).resolves.toHaveProperty('statusCode', 400);

  await expect(
    request(app)
      .post('/rv/ineritedDefaults')
      .set('Cookie', 'aCookie=str;')
      .send({ username: 'ab' })
  ).resolves.toHaveProperty('statusCode', 200);
});
