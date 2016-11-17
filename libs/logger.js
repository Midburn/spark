var winston = require('winston');
var config = require('config');

module.exports = function(module) {
    var filename = module.id;    
    
    function log(level, msg) {
        winston.log(level, filename + ' : ' + msg); 
    }
    
    return {
        init : function() {
            winston.configure({
                level: 'info'
                /* , File logger transports: [
                  new (winston.transports.File)({ filename: 'sparks.log' })
                ]*/
            });
        },

        
        // Aliases
        debug : function (msg) {
            log('debug', msg);
        },
        info : function (msg) {
            log('info', msg);
        },
        warn : function (msg) {
            log('warn', msg);
        },
        error  : function (msg) {
            log('error', msg);
        },
        fatal : function (msg) {
            log('fatal', msg);
        },

        // Log
        log : log
    }
}
