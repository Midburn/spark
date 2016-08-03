var mailer = require('express-mailer');

var ourApp;

module.exports = {
    setup : function (app) {
        ourApp = app;
        mailer.extend(ourApp, {
            from: 'spark@midburn.org',
            host: 'smtp.gmail.com', // hostname
            secureConnection: true, // use SSL
            port: 465, // port for secure SMTP
            transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
            auth: {
                user: 'gmail.user@gmail.com',
                pass: 'userpass'
            }
        });
    },

    // Send mail.
    // recipients - REQUIRED. This can be a comma delimited string.
    // from - REQUIRED.
    // subject - REQUIRED.
    // template - REQUIRED.
    // properties - All additional properties are also passed to the template as local variables.
    send : function (recipients, from, subject, template, properties) {
        console.log('Sending email to ', recipients);
        ourApp.mailer.send(template, {
            to: recipients,
            subject: subject,
            otherProperty: properties
        }, function (err) {
            if (err) {
                // handle error
                console.log('Error sending email', err);
                return false;
            }
            return true;
        });
    },

    NPO_EMAIL : 'amuta@midburn.org'
};