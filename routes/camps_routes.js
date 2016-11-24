const i18next = require('i18next'),
    recaptcha = require('express-recaptcha'),
    config = require('config'),
    i18nConfig = config.get('i18n'),
    serverConfig = config.get('server'),
    mailConfig = config.get('mail'),
    security = require('../libs/security'),
    mail = require('../libs/mail'),
    log = require('../libs/logger.js')(module),
    Camp = require('../models/camp').Camp;

module.exports = function(app, passport) {

    // ==============
    // Camps Routing
    // ==============
    // camps index
    app.get('/:lng/camps', security.protectGet, function(req, res) {
        res.render('pages/camps/index', {
            user: req.user
        });
    });
    // new camp
    app.get('/:lng/camps', security.protectGet, function(req, res) {
        res.render('pages/camps/new', {
            user: req.user
        });
    });

    // camp page (by id)
    app.get('/:lng/camps/:id', (req, res) => {
        res.render('/:lng/camp', {});
    });
};
