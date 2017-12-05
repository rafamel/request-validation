# moduleName

[![Version](https://img.shields.io/github/package-json/v/rafamel/request-validation.svg)](https://github.com/rafamel/request-validation)
[![Build Status](https://travis-ci.org/rafamel/request-validation.svg)](https://travis-ci.org/rafamel/request-validation)
[![Coverage](https://img.shields.io/coveralls/rafamel/request-validation.svg)](https://coveralls.io/github/rafamel/request-validation)
[![Dependencies](https://david-dm.org/rafamel/request-validation/status.svg)](https://david-dm.org/rafamel/request-validation)
[![Vulnerabilities](https://snyk.io/test/npm/request-validation/badge.svg)](https://snyk.io/test/npm/request-validation)
[![Issues](https://img.shields.io/github/issues/rafamel/request-validation.svg)](https://github.com/rafamel/request-validation/issues)
[![License](https://img.shields.io/github/license/rafamel/request-validation.svg)](https://github.com/rafamel/request-validation/blob/master/LICENSE)

**[*Express.js*](https://github.com/expressjs/expressjs.com) middleware for modular [*Joi*](https://github.com/hapijs/joi) request validations.**

- Define a base schema and build upon it using only some keys for some routes - you can use it with [*joi-add*](https://github.com/rafamel/joi-add) for an even more flexible design.
- Access the `request` inside *Joi* validations.
- Customize your error catching.
- Customize *Joi* options.

## Install

[`npm install request-validation`](https://www.npmjs.com/package/request-validation)

## Simple usage

```javascript
const router = require('express').Router();
const Joi = require('joi');
const RequestValidation = require('request-validation');

// Create validation for routes
const myValidation = RequestValidation({
    routes: {
        create: {
            body: Joi.object().keys({
                some: Joi.string().required(),
                other: Joi.number().required()
            })
        },
        patch: {
            body: Joi.object().keys({
                some: Joi.string(),
                other: Joi.number()
            })
        }
    }
});

// Add validation middleware to each route
router.post('/myRoute', myValidation.create, myController.create);
router.patch('/myRoute', myValidation.patch, myController.patch);
```

##  Advanced usage

### RequestValidation

For `const RequestValidation = require('request-validation');`, `RequestValidation` will be a function that:

- Takes an *object* with keys:
    - `schema` (optional): *Object* (**not** yet a *Joi* schema) to be converted into a *Joi* schema from which we can modularly define each of our routes schemas.
    - `routes` (optional): It can be:
        - An *Object* with keys for each route, and a *Joi* schema for one of several of `headers`, `body`, `query`, `params`, and `cookies`.
        - A function that receives the above `schema` and returns an *object* as described above.
    - `options` (optional): *Object.* [*Joi* options](https://github.com/hapijs/joi/blob/master/API.md#validatevalue-schema-options-callback) to use for all validation within this `RequestValidation`.

- Returns
