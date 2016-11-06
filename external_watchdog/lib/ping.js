'use strict'

const request = require('request');
const util = require('util');
const os = require('os');
const logger = require('./logger');

const emailTypes = {
    up : Symbol('is back'),
    down : Symbol('is down')
};

class Ping {
    constructor (opts) {
        this.website = '';
        this.interval = 30;
        this.handle = null;
        this.mailer = opts.mailer;
        this.retryLimit = opts.retryLimit;
        this.retryCount = 0;
        this.server = {
            status: true,
            lastStatus: true
        }
        this.email = opts.email;
        this.emailSendStatus = {
            serverUp: true,
            serverDown: false
        }
        this.sendEmailIfNeeded = {
            readyToSend: false,
            subject: '',
            message: '',
        };
        this.logInfoIfNeeded = {
            readyToLog: true,
            message: '',
            lastmessage: '',
        }
        this.onTick = opts.onTick;
        this.init(opts);
    }

    init (opts) {
        this.website = opts.website;
        this.interval = opts.interval * 1000;
        this.start();
    }
    start () {
        const self = this;
        let time = Date.now();
        self.ping();
        self.handle = setInterval( () => {
            self.ping();
        }, self.interval);
    }
    ping () {
        this.server.lastStatus = this.server.status;
        request(this.website, { timeout: 5000, followRedirect: false }, (error, res, json) => {
            try {
                json = JSON.parse(json);
            } catch (error) {

            }
            var isPong = json && json.hasOwnProperty('pong');
            isPong |= json && json.hasOwnProperty('data') && json.data.hasOwnProperty('pong');
            if (!error && res.statusCode === 200 && isPong) {
                this.isUp();
            } else {
                if (!error) {
                    if (res.statusCode !== 200) {
                        error = "Reason: statusCode " + res.statusCode;
                    } else if (!isPong) {
                        error = "Reason: no pong";
                    } else {
                        logger.info("should not get here");
                    }
                }
                this.isDown([error]);
            }
            this.onTick(this.server.status, this.website, error, this.sendEmailIfNeeded, this.logInfoIfNeeded);
        });
        this.sendEmailIfNeeded.readyToSend = false;
        this.logInfoIfNeeded.readyToLog = false;
    }
    isUp () {
        this.server.status = 1;
        this.retryCount = 0;

        if (this.server.status === 1 && this.server.lastStatus === 0 && !this.emailSendStatus.serverUp) {
            this.mail(this.website, emailTypes.up);
            this.logInfo('OK', '');
            this.emailSendStatus.serverDown = false;
            this.emailSendStatus.serverUp = true;
        } else {
            this.logInfo('UP', '');
        }
    }
    isDown (error) {
        this.server.status = 0;
        this.logInfo('DOWN', error);
        if (this.retryCount < this.retryLimit) {
            this.retryCount++;
        }
        if (this.retryCount >= this.retryLimit && !this.emailSendStatus.serverDown) {
            this.mail(this.website, emailTypes.down);
            this.emailSendStatus.serverUp = false;
            this.emailSendStatus.serverDown = true;
        }
    }
    mail (server, emailType) {
        if (!this.email.enabled) {
            return;
        }

        let time = Ping.getFormatedDate(Date.now());
        let subject;

        if (emailType === emailTypes.down) {
            logger.report(`Server ${server} changed status to DOWN at ${time}`);
            this.sendEmailIfNeeded.subject = `server ${server} is down`
            this.sendEmailIfNeeded.message = `<p>Time: ${time}<p>Server: ${server} changed status to DOWN<p>External_watchdog hostname: ${os.hostname()}, path: ${__dirname}`;
        }
        if (emailType === emailTypes.up) {
            logger.report(`Server ${server} changed status to UP at ${time}`);
            this.sendEmailIfNeeded.subject = `server ${server} is up`
            this.sendEmailIfNeeded.message = `<p>Time: ${time}<p>Server: ${server} changed status to UP<p>External_watchdog hostname: ${os.hostname()}, path: ${__dirname}`;
        }
        this.sendEmailIfNeeded.readyToSend = true;
    }
    logInfo (status, err) {
        let time = Ping.getFormatedDate(Date.now());
        this.logInfoIfNeeded.message = `Server: ${this.website}, Status: ${status} ${err}`

        if (this.logInfoIfNeeded.message !== this.logInfoIfNeeded.lastmessage) {
            this.logInfoIfNeeded.readyToLog = true;
        }

        this.logInfoIfNeeded.lastmessage = this.logInfoIfNeeded.message;
    }
    static getFormatedDate (time) {
        let currentDate = new Date(time);
        currentDate = currentDate.toISOString();
        currentDate = currentDate.replace(/T/, ' ');
        currentDate = currentDate.replace(/\..+/, '');
        return currentDate + " UTC";
    }
}

module.exports = Ping;