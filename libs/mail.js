var mailer = require('express-mailer');
var config = require('config');

var mailConfig = config.get('mail');
var ourApp;

module.exports = {
    setup : function (app) {
        ourApp = app;
        mailer.extend(ourApp, mailConfig);
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
                console.error('Error sending email', err);
                return false;
            }
            return true;
        });
    }
};