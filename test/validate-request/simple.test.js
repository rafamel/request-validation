'use strict';
const app = require('../app');
const request = require('supertest');

const id = (n) => `[${ String(n) }] `;
afterAll(() => app.close());

describe(`- Simple validate-request`, () => {
    test(id(1) + `Simple body validation passes`, () => {
        return request(app)
            .post('/simple/base')
            .send({ some: 'str', other: 4 })
            .expect(200);
    });
    test(id(2) + `Simple body validation fails`, () => {
        return request(app)
            .post('/simple/base')
            .send({ some: 'str' })
            .expect(400);
    });
});
