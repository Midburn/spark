const path = require('path');
const winston = require('winston');
const assert = require('assert');
const sprintf = require("sprintf-js").sprintf;
const dateFormat = require('dateformat');

module.exports = function (module) {
    assert(module);
    assert(module.id);

    var appDir = path.dirname(require.main.filename);
    var id = path.relative(appDir, module.id);

    var logger = new winston.Logger({
        transports: [
            new (winston.transports.Console)({
                timestamp: function () {
                    return dateFormat(Date.now(), "dd/mm/yy hh:MM:ss.l");
                },
                formatter: function (options) {
                    // Return string will be passed to logger.
                    return sprintf("%-33s", options.timestamp() + ' ' + options.level.toUpperCase() + ' ' + id + ' : ') + (options.message ? options.message : '') +
                        (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
                }
            })
        ]
    });

    function log(level, msg, vars) {
        logger.log(level, msg, vars);
    }

    // Make Morgan log work with Winston
    // http://stackoverflow.com/a/28824464/11236
    logger.stream = function (params) {
        return {
            write: function (message, encoding) {
                if (params.filter && !params.filter(message)) {
                    return;
                }

                if (message.endsWith('\n')) {
                    message = message.slice(0, -1);
                }
                logger.log(params.level, message);
            }
        }
    };

    return {
        log: log,

        logger: logger,

        // Aliases
        debug: function (msg, vars) {
            log('debug', msg, vars);
        },
        info: function (msg, vars) {
            log('info', msg, vars);
        },
        warn: function (msg, vars) {
            log('warn', msg, vars);
        },
        error: function (msg, vars) {
            log('error', msg, vars);
        },
    };
}
