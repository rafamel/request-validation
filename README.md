# request-validation

[![Version](https://img.shields.io/github/package-json/v/rafamel/request-validation.svg)](https://github.com/rafamel/request-validation)
[![Build Status](https://travis-ci.org/rafamel/request-validation.svg)](https://travis-ci.org/rafamel/request-validation)
[![Coverage](https://img.shields.io/coveralls/rafamel/request-validation.svg)](https://coveralls.io/github/rafamel/request-validation)
[![Dependencies](https://david-dm.org/rafamel/request-validation/status.svg)](https://david-dm.org/rafamel/request-validation)
[![Vulnerabilities](https://snyk.io/test/npm/request-validation/badge.svg)](https://snyk.io/test/npm/request-validation)
[![Issues](https://img.shields.io/github/issues/rafamel/request-validation.svg)](https://github.com/rafamel/request-validation/issues)
[![License](https://img.shields.io/github/license/rafamel/request-validation.svg)](https://github.com/rafamel/request-validation/blob/master/LICENSE)

**[*Express.js*](https://github.com/expressjs/expressjs.com) middleware for modular [*Joi*](https://github.com/hapijs/joi) request validations.**

- Validate the `headers`, `body`, `query`, `params`, and/or `cookies` of a request.
- Define a base schema and build upon it using only some keys for some routes - you can use it with [*joi-add*](https://github.com/rafamel/joi-add) for an even more flexible design.
- [Customize your error catching.](#error-handler)
- [Customize the *Joi* options for the validations.](#global-options)

[Check out here a full setup example - *joi-add* included](#full-setup-example)

## Install

[`npm install request-validation`](https://www.npmjs.com/package/request-validation)

## Simple usage

Create a `RequestValidation` for each of your routes.

```javascript
const router = require('express').Router();
const Joi = require('joi');
const { RequestValidation } = require('request-validation');

// Create validation for routes as Joi schemas
const myValidation = new RequestValidation({
    create: {
        body: Joi.object().keys({
            username: Joi.string().required(),
            password: Joi.string().required()
        })
    },
    patch: {
        body: Joi.object().keys({
            username: Joi.string(),
            password: Joi.string()
        })
    }
});

// Add validation middleware to each route
router.post('/myRoute', myValidation.create, myController.create);
router.patch('/myRoute', myValidation.patch, myController.patch);

module.exports = router;
```

## Setup

Because of *Node.js*'s `require()` caching, you'll only need to define your options and handler once in your application. You don't need to define them if you don't need them.

### Error handler

By default, if a validation fails, the *Joi* error is passed to `next()` as is - though in addition to having a property `error.isJoi = true`, request validation errors will have an additional `isRequestValidation = true` property.

If any other error occurs within the validation, it will also be passed to `next()`, though it will be neither a `isJoi` nor a `isRequestValidation` error.

[Check the default implementation here.](https://github.com/rafamel/request-validation/blob/master/lib/request-validation/validate-request.js)

Otherwise, if you wish to handle this errors directly, you can use `.handler()`; as an example:

```javascript
const rv = require('request-validation');
rv.handler((err, req, res, next) => {
    // If it's not a Joi error, sent to app error handler
    if (!err.isJoi) return next(err);
    // Only show Joi innermost message from the error array
    const innerMessage = err.details[0].message;
    res.status(400).json({
        status: 'error',
        message: innerMessage
    });
});
```

Remember that for it to applied on a `RequestValidation`, `new RequestValidation(...)` must be called *after* you define the handler.

### Global options

Global [*Joi* options](https://github.com/hapijs/joi/blob/master/API.md#validatevalue-schema-options-callback) validations will be called with.

```javascript
const rv = require('request-validation');
rv.options({
    defaults: { presence: 'required' },
    body: { presence: 'optional' },
    params: { allowUnknown: false }
});
```

`.options()` takes an object with keys `defaults`, `headers`, `body`, `query`, `params`, and/or `cookies`, to define options for each. All of them, if it exists, will inherit from `defaults`, meaning if a key doesn't exist on any, and it does on `defaults`, that one will apply.

Options will be applied in a non exclusive manner, meaning there are different places where they can be set, with different scopes, but will never replace the previous options object and will inherit from it whenever a key doesn't exist.

The options inheritance tree, from least to most priority, is:

1. [*Joi* defaults](https://github.com/hapijs/joi/blob/master/API.md#validatevalue-schema-options-callback)
1. This module defaults: `{ abortEarly: true, convert: false, stripUnknown: true, presence: 'optional' }`
1. Global options:
    1. `defaults`
    1. The one corresponding to each property (`headers`, `body`...)
1. [`RequestValidation` options](#requestvalidation)
    1. `defaults`
    1. The one corresponding to each property (`headers`, `body`...)
1. [`ValidationSchema` options](#schemaoptionsopts)
    1. `defaults`
    1. The one corresponding to each property (`headers`, `body`...)

## RequestValidation

*Class:* `new RequestValidation(routes, options)`

- `routes`: *Object* with a key for each route, defining either:
    - A [`ValidationSchema`](#validationschema),
    - An *object* with keys `headers`, `body`, `query`, `params`, and/or `cookies`, containing a *Joi* validation for each.
- `options` (optional): *Object,* with the same format as the [global options](#global-options), taking priority over them.

```javascript
const router = require('express').Router();
const Joi = require('joi');
const { RequestValidation } = require('request-validation');

const myValidation = new RequestValidation({
    create: {
        body: Joi.object().keys({
            username: Joi.string(),
            password: Joi.string()
        })
    },
    patch: {
        body: Joi.object().keys({
            username: Joi.string().optional(),
            password: Joi.string().optional()
        }),
        params: {
            id: Joi.number().integer()
        }
    }
}, {
    defaults: { presence: 'required' },
    params: { convert: true }
});

router.post('/myRoute', myValidation.create, myController.create);
router.patch('/myRoute', myValidation.patch, myController.patch);

module.exports = router;
```

## ValidationSchema

Blueprint to build each of your routes validations without repeating yourself. It offers several helpful methods to pick and choose which validations should apply and which shouldn't, as well as [the options that should be applied](#schemaoptionsopts) and which keys to be marked as [required](#schemarequiredstandardkeypath), [optional](#schemaoptionalstandardkeypath), or [forbidden](#schemaforbiddenstandardkeypath) for each specific route.

*Class:* `new ValidationSchema(schema)`

- `schema`: *Object* with keys `'headers'`, `'body'`, `'query'`, `'params'`, and/or `'cookies'`, each containing an innner *object* with the *Joi* validations we'll build upon for each route.

As an example of `ValidationSchema` and `RequestValidation` in action:

```javascript
const router = require('express').Router();
const Joi = require('joi');
const { ValidationSchema, RequestValidation } = require('request-validation');

const schema = new ValidationSchema({
    body: {
        username: Joi.string()
            .min(4).max(16)
            .regex(/^[a-zA-Z0-9_]+$/)
            .label('Username'),
        password: Joi.string()
            .min(8).max(20)
            .regex(/^[a-zA-Z0-9_]+$/)
            .label('Password'),
        email: Joi.string()
            .email()
            .label('Email')
    },
    params: {
        id: Joi.number().integer().options({ convert: true })
    }
});

const validate = new RequestValidation({
    create: schema.useBody(),
    login: schema.useBody('username', 'password'),
    show: schema.useParams(),
    update: schema.presenceBody('optional'),
    patch: {
        body: schema.presenceBody('optional').body,
        params: schema.useParams('id').params,
    }
}, {
    defaults: { presence: 'required' }
});

// Add validation middleware to each route
router.post('/user/register', validate.create, myController.create);
router.post('/user', validate.login, myController.login);
router.get('/user/:id', validate.show, myController.show);
router.put('/user/:id', validate.update, myController.update);
router.patch('/user/:id', validate.patch, myController.patch);

module.exports = router;
```

It's totally up to you to adopt a more explicit style declaring the fields to use or not, [though it'd probably be best to be explicit for the sake of clarity.](#full-setup-example)

[Here's a full setup example](#full-setup-example)

### Methods

`ValidationSchema` methods don't mutate the base schema object. They're chainable and cumulative, and won't execute or build the Joi validations themselves until the [`.schema` property](#properties) is called (either manually by you or automatically when used in any `RequestValidation` route); then, they're called sequentially, in the order they were defined on.

#### Aliases

All methods but `.clear()` are aliased for `'headers'`, `'body'`, `'query'`, `'params'`, and `'cookies'`. So for each `.method()`, all of `.methodHeaders()`, `.methodBody()`, `.methodQuery()`, `.methodParams()`, and `.methodCookies()` will exist in such way that calling:

- `.methodBody(arguments)` will be equivalent to calling `.method({ body: arguments })`, and
- `.methodBody()` to `.method('body')`

#### Standard key path arguments

`ValidationSchema` methods that take standard key path arguments (`standardKeyPath`) to define the keys they should be applied to can take:

- Dot separated string for each key path as:
    - separate arguments
    - an *array*
- Object, with the innermost key containing:
    - a *string*
    - an *array of strings*

As an example, if for this schema:

```javascript
const schema = new ValidationSchema({
    body: {
        username: ...,
        password: ...,
        email: ...
    },
    params: {
        id: ...
    }
});
```

...we wanted to select the `username` , and all `params` validations, we could do any of:

```javascript
schema.method('body.username', 'params');
schema.method(['body.username', 'params']);
schema.method({ body: 'username' }, 'params');
schema.method({ body: ['username'] }, 'params');
schema.methodBody('username').methodParams();
```

#### `schema.use(standardKeyPath)`

It will exclusively select the properties (including their children, if any) to use from a schema. Whenever `.use()` is called, the resulting schema will only have the properties selected by it. If `.use()` is never called on the chain, all properties will be selected. [It's aliased for each request property.](#aliases)

- `standardKeyPath`: The paths for the keys to use as any of the [standard key path arguments.](#standard-key-path-arguments)

All these would be equivalent and maintain all `'params'` validations and only the `'username'` validation for `'body'` from the parent schema:

```javascript
schema.use('params', 'body.username');
schema.use('params').use({ body: 'username' });
schema.useParams().useBody('username');
```

Be careful, as all inner keys of any selected property will be included. As an example, `schema.use('params', 'body').useBody('username');` will produce a schema with all `'params'` and `'body'` validations (not just `'username'`).

#### `schema.skip(standardKeyPath)`

It will remove properties from a schema. [It's aliased for each request property.](#aliases)

- `standardKeyPath`: The paths for the keys to skip as any of the [standard key path arguments.](#standard-key-path-arguments)

All these would be equivalent and remove keys `'password'` and `'email'` from the schema `'body'`:

```javascript
schema.skip('body.password', 'body.email');
schema.skip({ body: ['password', 'email'] });
schema.skipBody('password', 'email');
```

#### `schema.add(addSchema)`

It will add keys to a previously defined schema. If a key where a *Joi* validation lives already exists in the previous schema, it will replace it. [It's aliased for each request property.](#aliases)

- `addSchema`: New schema with the keys to add.

These will replace the `'username'` validation for a new one and add a new `'bio'` validation. They are equivalent:

```javascript
schema.add({
    body: {
        username: Joi.string().min(6).max(16).label('Username'),
        bio: Joi.string().max(1200).label('Bio')
    }
});

schema.addBody({
    username: Joi.string().min(6).max(16).label('Username'),
    bio: Joi.string().max(1200).label('Bio')
});
```

You can even replace keys by directly accessing and modifying the [built *Joi* object:](#properties)

```javascript
schema.add({ body: schema.body.requiredKeys(['username', 'password']) });
schema.addBody(schema.body.requiredKeys(['username', 'password']));
```

Because in this case the schema will need to be built twice and it's a little too verbose, we can use the methods [`.required()`](#schemarequiredstandardkeypath), [`.optional()`](#schemaoptionalstandardkeypath), [`.forbidden()`](#schemaforbiddenstandardkeypath), and [`.presence()`](#schemapresenceobj) to set the presence requirements of keys.

#### `schema.concat(concatSchema)`

It will concatenate a *Joi* validation to a previously existing validation via [Joi.any().concat()](https://github.com/hapijs/joi/blob/master/API.md#anyconcatschema). If a key doesn't exist in the previously defined schema, it will add it. [It's aliased for each request property.](#aliases)

- `concatSchema`: New schema with the keys to concatenate/merge.

These will run the previous `'username'` validation in addition to the new one we're defining, and add a new `'bio'` validation. They are equivalent:

```javascript
schema.concat({
    body: {
        username: Joi.string().min(6),
        bio: Joi.string().max(1200).label('Bio')
    }
});

schema.concatBody({
    username: Joi.string().min(6),
    bio: Joi.string().max(1200).label('Bio')
});
```

#### `schema.required(standardKeyPath)`

It will require specific keys on a schema. [It's aliased for each request property.](#aliases)

- `standardKeyPath`: The paths for the keys to required as any of the [standard key path arguments.](#standard-key-path-arguments)

All these would be equivalent and require keys `'username'` and `'password'` from the schema `'body'`:

```javascript
schema.required('body.username', 'body.password');
schema.required({ body: ['username', 'password'] });
schema.requiredBody('username', 'password');
```

#### `schema.optional(standardKeyPath)`

Same as `.required()` but sets keys to optional. [It's aliased for each request property.](#aliases)

#### `schema.forbidden(standardKeyPath)`

Same as `.required()` and `.optional()` but sets keys to forbidden. [It's aliased for each request property.](#aliases)

#### `schema.options(opts)`

Sets *Joi* validation options. [It's aliased for each request property.](#aliases)

- `opts`: *Object,* with the same format as the [global options](#global-options) and [`RequestValidation` options](#requestvalidation), taking priority over them.

These will set the `'presence'` for `'body'` to `'required'`, and to `'optional'` for all others. They are equivalent:

```javascript
schema.options({
    defaults: { presence: 'optional' },
    body: { presence: 'required' }
});

schema.options({ defaults: { presence: 'optional' } })
    .optionsBody({ presence: 'required' });
```

#### `schema.presence(presence)`

Sets *Joi* validation option for presence which will apply to all keys that don't have a explicit presence requirement set. It's shorthand for `schema.options({ presence: ... })`. [It's aliased for each request property.](#aliases)

- `presence`: Can be either:
    - A *string* to set as defaults, with value `'required'`, `'optional'`, or `'forbidden'`.
    - An *object* with keys `'defaults'`, `'headers'`, `'body'`, `'query'`, `'params'`, and/or `'cookies'`, containing a *string* with value `'required'`, `'optional'`, or `'forbidden'` for each.

These will set the `'presence'` of all to `'optional'`, but `'body'`, which will be `'required'`. They are equivalent:

```javascript
schema.presence({
    defaults: 'optional',
    body: 'required'
});

schema.presence('optional')
    .presence({ body: 'required' });

schema.presence('optional')
    .presenceBody('required');
```

#### `schema.clear()`

It returns an unbuilt schema to its original state. Here, `a` and `b` would be equivalent:

```javascript
const a = schema;
const b = schema.use('body', 'params').skip('body.email').clear();
```

### Properties

#### `schema.schema`

Also aliased as: `.headers`, `.body`, `.query`, `.params`, and `.cookies`. As an example, `schema.body` would be equivalent to `schema.schema.body`.

When schema is called, all methods applied to the `ValidationSchema` execute and a *Joi* validation is built for each (`headers`, `body`, `query`, `params`, and `cookies`).

It returns an object with each of those keys (if they exist in the schema) with a *Joi* validation for each.

```javascript
const schema = new ValidationSchema({
    ...
});

// Accessing '.schema' will run the modifications and build our Joi schemas
schema.schema;

// These would be equivalent:
schema.schema.body;
schema.body;
```

## Full Setup Example

We're also using [*joi-add*](https://github.com/rafamel/joi-add) here for some extra flexibility:

### `app.js`

```javascript
'use strict';
const express = require('express');
const rv = require('request-validation');

// Pass Joi to joi-add (so we don't further have to)
const baseJoi = require('joi');
require('joi-add')(baseJoi);

// Set request-validation global options (if needed)
rv.options({ headers: { stripUnknown: false } });

// Set request-validation error handler (if needed)
// It must be define before we invoque our router and
// the RequestValidations are built
rv.handler((err, req, res, next) => {
    // If it's not a Joi error, send to global error handler
    if (!err.isJoi) return next(err);
    // Show Joi innermost message from the error array as message
    // if it's a joi-add exmplicitly set message or label,
    // otherwise, show 'Bad Request'
    const details = err.details[0];
    const message = (details.context.isExplicit || details.context.addLabel)
        ? details.message
        : 'Bad Request';
    res.status(400).json({
        status: 'error',
        message: message,
        full: err.message
    });
});

// 404
app.use((req, res, next) => {
    return res.status(404).json({
        status: 'error',
        message: 'Not Found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    res.status(500).json({
        status: 'error',
        message: err.message
    });
});

const app = express();
app.use('/user/', require('user.routes'));
app.listen(3000);
```

### `user.routes.js`

```javascript
const router = require('express').Router();
const user = require('user.controller');
const validate = require('user.validation');

router.post('/user/register', validate.create, user.create);
router.post('/user', validate.login, user.login);
router.get('/user/:id', validate.show, user.show);
router.put('/user/:id', validate.update, user.update);
router.patch('/user/:id', validate.patch, user.patch);

module.exports = router;
```

### `user.validation.js`

```javascript
const Joi = require('joi-add')();
const { ValidationSchema, RequestValidation } = require('request-validation');

const schema = new ValidationSchema({
    body: {
        username: Joi.string()
            .min(4).max(16)
            .add((it) => it.regex(/^[a-zA-Z0-9_]+$/),
                'Username should only contain letters, numbers, and underscores (_).')
            .addLabel('Username'),
        password: Joi.string()
            .min(8).max(20)
            .add((it) => it.regex(/^[a-zA-Z0-9_]+$/),
                'Password should only contain letters, numbers, and underscores (_).')
            .addLabel('Password'),
        email: Joi.string()
            .email()
            .addLabel('Email')
    },
    params: {
        id: Joi.number().integer().options({ convert: true })
    }
});

module.exports = new RequestValidation({
    create: schema
        .useBody('username', 'password', 'email')
        .presence('required'),
    login: schema
        .useBody('username', 'password')
        .presence('required'),
    show: schema
        .useParams('id')
        .presence('required'),
    update: schema.use({
        body: ['username', 'password', 'email'],
        params: 'id'
    }),
    patch: schema.use({
        body: ['username', 'password', 'email'],
        params: 'id'
    })
});
```
