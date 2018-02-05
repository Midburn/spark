const config = require('config'),
    mail = require('../libs/mail'),
    mailConfig = config.get('mail');

class EmailService {
    emailDeliver(recipient, subject, template, props) {

        /**
         * Deliver email request to camp manager
         * notifiying a user wants to join his camp
         * @return {boolean} should return true if mail delivered. FIXME: in mail.js
         */
        console.log('Trying to send mail to ' + recipient + ' from ' + mailConfig.from + ': ' + subject + ', template ' + template);
        mail.send(
            recipient,
            mailConfig.from,
            subject,
            template, props
        )
    };
}

module.exports = new EmailService();
