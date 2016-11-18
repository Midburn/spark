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
        if (!mailConfig.enabled) {
            console.log('NOT Sending email to', recipients);
            return true;
        }
        console.log('Sending email to', recipients);
        var locals = {
            to: recipients,
            subject: subject
        };
        for (var localVar in properties) {
            locals[localVar] = properties[localVar];
        }
        ourApp.mailer.send(template, locals, function (err) {
            if (err) {
                // handle error
                console.error('Error sending email', err);
                return false;
            }
            console.log('Mail sent successfully');
            return true;
        });
    }
};