const i18next = require('i18next'),
    recaptcha = require('express-recaptcha'),
    config = require('config'),
    i18nConfig = config.get('i18n'),
    serverConfig = config.get('server'),
    mailConfig = config.get('mail'),
    userRole = require('../libs/user_role'),
    mail = require('../libs/mail'),
    log = require('../libs/logger.js')(module);


module.exports = function(app, passport) {

    app.get('/:lng/volunteers', userRole.isLoggedIn(), (req, res) => {
        res.render('pages/volunteers/index', {
            user: req.user
        });
    });
};
