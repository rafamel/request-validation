'use strict';
const id = (n) => `[${ String(n) }] `;
const app = require('../_setup');
const request = require('supertest');

afterAll(() => app.close());

test(id(1) + `Validation passes`, async () => {
    for (let url of ['/simple/query/base', '/simple/query/unbuilt']) {
        const { statusCode } = await request(app)
            .get(url + '?some=str&other=4')
            .send();
        expect(statusCode).toBe(200);
    }
});

test(id(2) + `Validation fails`, async () => {
    for (let url of ['/simple/query/base', '/simple/query/unbuilt']) {
        const { statusCode } = await request(app)
            .get(url + '?some=str')
            .send();
        expect(statusCode).toBe(400);
    }
});

test(id(3) + `Unknown keys are stripped`, async () => {
    for (let url of ['/simple/query/base', '/simple/query/unbuilt']) {
        const { body } = await request(app)
            .get(url + '?some=str&other=4&better=2&more=some')
            .send();
        expect(body.data.query)
            .toEqual({ some: 'str', other: '4' });
    }
});

test(id(4) + `Object mutates on pass`, () => {
    return request(app)
        .get('/simple/query/mutates?some=4')
        .send()
        .expect(200)
        .then(({ body }) => {
            expect(body.data.query)
                .toHaveProperty('some', 4);
            expect(body.data.query)
                .toHaveProperty('other', 'a default string');
        });
});
