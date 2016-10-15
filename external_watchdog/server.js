'use strict'

const fs = require('fs');
const os = require('os');
const express = require('express');
const cors = require('cors');
const app = express();
const q = require('q');

const Ping = require('./lib/ping');
const CronJob = require('cron').CronJob;
const logger = require('./lib/logger');

var argv = require('minimist')(process.argv.slice(2));
var CONFIG_FILE_PATH = argv.config || process.env.CON_CONFIG;

if (!CONFIG_FILE_PATH) {
    throw new Error('Config file not specified! Use --config parameter.');
}

const config = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf8'));
const Mailer = require('./../lib/mailer')
const mailerConfig = Mailer.getMailerConfig(config.email);
const mailer = new Mailer(mailerConfig);

process.on('uncaughtException', (error) => {
    const logPromise = logger.report(`Caught exception: ${error.stack}`);
    let message = `<p>Pictales external_watchdog crash`;
    message += `<br>External_watchdog hostname: ${os.hostname()}, path: ${__dirname}`;
    message += `<br>${error.stack.replace(/\n/g,'<br>')}`;
    const emailPromise = mailer.send(config.email.to, "Pictales external_watchdog crash", message).catch(mailError => {
        return logger.report('Email not sent', mailError.stack)
    });
    return q.all([logPromise, emailPromise]).done(() => {
        process.exit(1);
    });
});

app.listen(config.server.port);

const reportPath = config.logs.dir + config.logs.daily;

const job = new CronJob({
    cronTime: config.dailyReportTime,
    onTick: function () {
        const report = fs.readFileSync(reportPath, 'utf8');
        const subject = 'Pictales external_watchdog daily report';
        let message = `<p>Pictales external_watchdog daily report`;
        message += `<br>External_watchdog hostname: ${os.hostname()}, path: ${__dirname}`;
        message += `<br>External watchdog monitors ${config.pingEndpoints.length} endpoints`;
        if (report) {
            message += `<p>${report.replace(/\n/g,'<br>')}`
        } else {
            message += '<p>Nothing to report';
        }
        mailer.send(config.email.to, subject, message)
            .fail( error => { logger.report('Email not sent') });
        logger.info('Daily report sent');
        fs.writeFile(reportPath, ''); //wipe report
    },
    start: true,
    timeZone: 'Europe/Warsaw'
});

logger.report(`\nExternal_watchdog started on hostname: ${os.hostname()} \nExternal_watchdog path: ${__dirname} \n`);

function padRight (str, len) {
    var blank = ' '.repeat(len);
    var newstr = str.concat(blank).slice(0, len);
    return newstr;
}

const pingCount = config.pingEndpoints.length;
const websitePadLen = Math.max.apply(Math, config.pingEndpoints.map((website) => website.length)) + 4;

var pingUpdatedDict = {};
var serverInfo = [];

const pingUpdated = (isUp, website, reason, email, log) => {
    let status = isUp ? 'UP' : 'DOWN';
    reason = reason ? reason : '';

    pingUpdatedDict[website] = {
        status: status,
        reason: reason,
        email: email,
        log: log,
    }
    checkIfAllPingsUpdated();
}

var checkIfAllPingsUpdated;
{
    var busy = false;
    var someoneCalled = false;

    checkIfAllPingsUpdated = function() {
        if (busy) {
            someoneCalled = true;
        } else {
            busy = true;
            if (Object.keys(pingUpdatedDict).length == pingCount) {
                serverInfo = [];
                serverInfo.push('Server info: ' + Ping.getFormatedDate(new Date()));

                var dateLogged = false;
                config.pingEndpoints.forEach( website => {
                    if (pingUpdatedDict[website].log.readyToLog) {
                        if (!dateLogged) {
                            dateLogged = true;
                            logger.info(Ping.getFormatedDate(new Date()));
                        }
                        logger.info(pingUpdatedDict[website].log.message);
                    }
                });

                console.log("\nSummary\t" + Ping.getFormatedDate(new Date()));
                config.pingEndpoints.forEach( website => {
                    const logLine = `${pingUpdatedDict[website].status}\t${padRight(website,websitePadLen)}${pingUpdatedDict[website].reason}`;
                    console.log(logLine);
                    serverInfo.push(logLine);
                    if (pingUpdatedDict[website].email.readyToSend) {
                        mailer.send(config.email.to, pingUpdatedDict[website].email.subject, pingUpdatedDict[website].email.message)
                            .fail( error => { logger.report('Email not sent') })
                    }
                });
                pingUpdatedDict = {};
            }
            busy = false;
            if (someoneCalled) {
                someoneCalled = false;
                checkIfAllPingsUpdated();
            }
        }
    }
}

app.options('/info', cors());
app.get('/info', cors(), (req,res) => {
    res.send(serverInfo.join("\n").toString() + '\n');
})

config.pingEndpoints.forEach( website => {
    let monitor = new Ping ({
        website: website,
        interval: config.interval,
        email: config.email,
        mailer: mailer,
        retryLimit: config.retryLimit,
        onTick: pingUpdated,
    });
});
