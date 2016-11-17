var winston = require('winston');
var config = require('config');

module.exports = function(module) {
    var filename = module.id;    
    
    function log(level, msg, vars) {
        winston.log(level, filename + ' : ' + msg, vars); 
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
        debug : function (msg, vars) {
            log('debug', msg, vars);
        },
        info : function (msg, vars) {
            log('info', msg, vars);
        },
        warn : function (msg, vars) {
            log('warn', msg, vars);
        },
        error  : function (msg, vars) {
            log('error', msg, vars);
        },
        
        // Log
        log : log
    }
}
