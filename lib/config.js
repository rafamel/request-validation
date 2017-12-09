'use strict';

module.exports = {
    moduleName: 'request-validation',
    options: {
        abortEarly: true,
        convert: false,
        stripUnknown: true,
        presence: 'optional'
    },
    req: ['headers', 'body', 'query', 'params', 'cookies'],
    get reqRegexp() {
        const str = this.req.reduce((acc, x) => acc + x + '|', '').slice(0, -1);
        return {
            all: new RegExp(`^(${str})$`),
            defaults: new RegExp(`^(defaults|${str})$`)
        };
    }
};
