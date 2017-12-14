'use strict';
const config = require('../../../lib/config');

module.exports = function handler(req, res, next) {
    const ans = {};
    config.req.forEach(x => { ans[x] = req[x]; });
    res.status(200)
        .json({
            status: 'success',
            data: ans
        });
};
