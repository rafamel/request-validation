'use strict';
const express = require('express');
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
const router = require('./router');
const config = require('../../lib/config');

// Initialize Express
const app = express();
app.use(bodyParser.json()); // Body parser

// Routes
app.use(router, (req, res, next) => { next('passed'); });

// 404
app.use((req, res, next) => {
    return res.status(404)
        .json({
            status: 'error',
            error: 'Not Found'
        });
});
// Handler
app.use((data, req, res, next) => {
    if (data instanceof Error) {
        const status = (data.isJoi) ? 400 : 500;
        return res.status(status)
            .json({
                status: 'error',
                statusCode: status,
                error: data.message
            });
    }
    const ans = {};
    config.req.forEach(x => { ans[x] = req[x]; });
    res.status(200)
        .json({
            status: 'success',
            data: ans
        });
});

module.exports = app.listen(3000, () => {
    console.log('Server running on port', 3000);
});
