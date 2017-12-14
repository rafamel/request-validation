'use strict';
const id = (n) => `[${ String(n) }] `;
const app = require('../_setup');
const request = require('supertest');

afterAll(() => app.close());

test(id(1) + `Validation passes`, async () => {
    for (let url of ['/simple/body/base', '/simple/body/unbuilt']) {
        const { statusCode } = await request(app)
            .post(url)
            .send({ some: 'str', other: 4 });
        expect(statusCode).toBe(200);
    }
});

test(id(2) + `Validation fails`, async () => {
    for (let url of ['/simple/body/base', '/simple/body/unbuilt']) {
        const { statusCode } = await request(app)
            .post(url)
            .send({ some: 'str' });
        expect(statusCode).toBe(400);
    }
});

test(id(3) + `Unknown keys are stripped`, async () => {
    for (let url of ['/simple/body/base', '/simple/body/unbuilt']) {
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

test(id(4) + `Object mutates on pass`, () => {
    return request(app)
        .post('/simple/body/mutates')
        .send({ some: '4' })
        .expect(200)
        .then(({ body }) => {
            expect(body.data.body)
                .toHaveProperty('some', 4);
            expect(body.data.body)
                .toHaveProperty('other', 'a default string');
        });
});
