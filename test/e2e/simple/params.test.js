'use strict';
const id = (n) => `[${ String(n) }] `;
const app = require('../_setup');
const request = require('supertest');

afterAll(() => app.close());

test(id(1) + `Validation passes`, async () => {
    for (let url of ['/simple/params/base', '/simple/params/unbuilt']) {
        const { statusCode } = await request(app)
            .get(url + '/4')
            .send();
        expect(statusCode).toBe(200);
    }
});

test(id(2) + `Validation fails`, async () => {
    for (let url of ['/simple/params/base', '/simple/params/unbuilt']) {
        const { statusCode } = await request(app)
            .get(url + '/5')
            .send();
        expect(statusCode).toBe(400);
    }
});

test(id(3) + `Object mutates on pass`, () => {
    return request(app)
        .get('/simple/params/mutates/4')
        .send()
        .expect(200)
        .then(({ body }) => {
            expect(body.data.params)
                .toHaveProperty('some', 4);
            expect(body.data.params)
                .toHaveProperty('other', 'a default string');
        });
});
