'use strict'

const winston = require('winston');
const config = JSON.parse(require('fs').readFileSync('./config.json', 'utf8'));
const q = require('q');

let logger = new (winston.Logger)({
    levels: {
        report: 0,
        info: 1
    },
    transports: [
        new (winston.transports.File)({
            name: 'info',
            filename: config.logs.dir + config.logs.watchdog,
            level: 'info',
            timestamp: true,
            json: false
        }),
        new (winston.transports.Console)({
            name: 'console',
            level: 'info',
            timestamp: false,
            json: false
        }),
        new (winston.transports.File)({
            name: 'report',
            filename: config.logs.dir + config.logs.daily,
            level: 'report',
            timestamp: true,
            json: false
        }),
    ]
});

function loggerPromise (transport, logger) {
    const internalLogMessage = function (message) {
        let deferred = q.defer();
        let winstonArgs = Array.prototype.slice.call(arguments); //apply variable args from message
        winstonArgs.push((err, level, msg, meta) => { //callback from winston
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve();
            }
        });
        transport.apply(transport, winstonArgs);
        return deferred.promise;
    }
    return internalLogMessage;
}

module.exports = {
    logger: logger,
    report: loggerPromise(logger.report, logger),
    info: loggerPromise(logger.info, logger),
    console: loggerPromise(logger.console, logger),
}