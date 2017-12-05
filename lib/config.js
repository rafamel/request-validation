'use strict';

module.exports = {
    moduleName: 'request-validation',
    req: ['headers', 'body', 'query', 'params', 'cookies'],
    options: {
        abortEarly: true,
        convert: false,
        stripUnknown: true,
        presence: 'optional'
    }
};
