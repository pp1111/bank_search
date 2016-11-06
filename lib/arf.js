'use strict';
 
const q = require('q');
 
const arf = {};

arf.response = (res, data, status) => q.async(function* () {
    status = status || 200;
    var body = {};
 
    if (data instanceof Error) {
        status = data.status || 500;
        body.error = {
            type: data.code,
            message: data.message,
            additional: data.additionalData || {},
        };
 
        // TODO: exclude non-custom errors
        if (data.inner) {
            body.error.additional.inner_error = {
                type: data.inner.code,
                message: data.inner.message,
                additional: data.inner.additionalData || {},
            };
        }
    } else {
        body = data.toJSON ? data.toJSON() : data;
    }
 
    res.header('Content-Type', 'application/json');
    return res.status(status).end(JSON.stringify(body));
})();

module.exports = arf;