const logger = require('../../libs/logger')(module),
    config = require('config'),
    mail = require('../../libs/mail'),
    mailConfig = config.get('mail');

class HelperService {
    emailDeliver(recipient, subject, template, props) {

        /**
         * Deliver email request to camp manager
         * notifiying a user wants to join his camp
         * @return {boolean} should return true if mail delivered. FIXME: in mail.js
         */
        logger.log('Trying to send mail to ' + recipient + ' from ' + mailConfig.from + ': ' + subject + ', template ' + template);
        mail.send(
            recipient,
            mailConfig.from,
            subject,
            template, props
        )
    };

    errorMiddleware(routeName) {
        /**
         * Return error middleware to be used in each router
         */
        const errorCatcher = (err, req, res, next) => {
            logger.error(`${routeName} Router Error`, err.stack); // e.g., Not valid name
            return res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        };
        return errorCatcher();
    };
}

/**
 * Export singleton
 * @type {HelperService}
 */
module.exports = new HelperService();
