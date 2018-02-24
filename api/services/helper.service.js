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

    customError(status, msg, res, isError) {
        return res.status(status).json({
            error: isError,
            data: {
                message: msg
            }
        });
    }

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

    updateProp(item, origin, propName, options) {
        /**
         * Add property to item.
         */
        if (origin[propName] !== undefined) {
            let value = origin[propName];
            if (!options || (options instanceof Array && options.indexOf(value) > -1)) {
                item[propName] = value;
            }
            return value;
        }
    }

    updateForeignProp(item, origin, propName) {
        /**
         * Add foreign key to origin. (parse int)
         */
        if (parseInt(origin[propName]) > 0) {
            item[propName] = origin[propName];
        }
    }

    getFields(input, field) {
        const output = [];
        for (let i = 0; i < input.length; ++i) {
            output.push(input[i][field]);
        }
        return output;
    }

}

/**
 * Export singleton
 * @type {HelperService}
 */
module.exports = new HelperService();
