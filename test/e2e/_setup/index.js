'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const rv = require('../../../lib');

// Initialize Express
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

// Routes for simple tests
app.use('/simple', require('./simple/router'));

// RequestValidation options
app.use('/global', require('./global/pre-options'));
rv.options({
    defaults: { presence: 'required' },
    headers: { presence: 'optional' }
});
app.use('/global', require('./global/options'));

// RequestValidation tests
app.use('/rv', require('./rv'));

// RequestValidation error handler
rv.handler((error, req, res, next) => {
    return res.status(400)
        .json({
            isHandler: true,
            error: error.message
        });
});
app.use('/global', require('./global/handler'));

// 404
app.use((req, res, next) => {
    return res.status(404)
        .json({
            status: 'error',
            error: 'Not Found'
        });
});

// Global error handler
app.use((error, req, res, next) => {
    const status = (error.isJoi && error.isRequestValidation)
        ? 400 : 500;
    return res.status(status)
        .json({
            status: 'error',
            statusCode: status,
            error: error.message
        });
});

module.exports = app.listen(3000);
