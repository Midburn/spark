const logger = require('../../../libs/logger')(module),
    config = require('config'),
    _ = require('lodash'),
    mail = require('../../../libs/mail'),
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

    initForbiddenMiddleware() {
        return (err, req, res, next) => {
            // Handle CSRF token errors
            const isDev = process.env.NODE_ENV === 'development' ||
            process.env.NODE_ENV === 'staging';
            if (err.code === 'EBADCSRFTOKEN') {
                res.status(403);
                res.render('pages/error', {
                    errorMessage: 'Illegal action. Your connection details has been logged.',
                    error: isDev ? {
                        status: 'URL: ' + req.url
                    } : err
                });
                return;
            }
            res.status(err.status || 500);
            res.render('pages/error', {
                errorMessage: err.message,
                error: isDev ? err : {}
            });
        }
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
        return errorCatcher;
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

    getUserDetailsFromDrupal(data) {
        return {
            uid       : _.get(data, 'uid', -1),
            name      : _.get(data, 'name', ''),
            firstname : _.get(data, 'field_profile_first.und.0.value', ''),
            lastname  : _.get(data, 'field_profile_last.und.0.value', ''),
            phone     : _.get(data, 'field_profile_phone.und.0.value', -1),
        }
    };

}

/**
 * Export singleton
 * @type {HelperService}
 */
module.exports = new HelperService();
