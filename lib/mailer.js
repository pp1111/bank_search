'use strict';

var q = require('q');
var email = require('emailjs');
var util = require('util');


function Mailer (opts) {
    if (!(this instanceof Mailer)) {
        return new Mailer(opts);
    }

    if (!opts || !opts.user | !opts.password || !opts.host || !opts.from) {
        throw new Error('Insufficient options passed to mailer!');
    }

    this.opts = opts;
    this.server = email.server.connect(this.opts);
}


Mailer.prototype.send = function (to, subject, htmlBody) {
    var opts = this.opts;
    var server = this.server;
    return q.fcall(function () {
        if (!opts.enabled) {
            throw new Error("Email disabled");
        }
        var message = {
            from: util.format('%s <%s>', opts.from, opts.user),
            to: to,
            subject: subject,
            attachment: [{
                data: htmlBody,
                alternative: true,
            }],
        };

        return q.ninvoke(server, 'send', message);
    })
};

Mailer.getMailerConfig = function (config) {
    var mailerConfig = {
        enabled: config.enabled,
        user: config.username,
        password: config.password,
        host: config.host,
        port: config.port,
        from: config.from,
        to: config.to,
        tls: true
    };
    if (config.timeout) {
        mailerConfig.timeout = config.timeout;
    }
    return mailerConfig;
}

module.exports = Mailer;