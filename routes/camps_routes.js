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
    app.get('/:lng/camps', security.protectGet, (req, res) => {
        // camps index page, create new camp
        res.render('pages/camps/index', {
            user: req.user
        });
    });
    app.get('/:lng/camps/new', security.protectGet, (req, res) => {
        // new camp
        res.render('pages/camps/new', {
            user: req.user,
            camp_name_en: req.query.c
        });
    });
    app.get('/:lng/camps/:id', (req, res) => {
        // camp page (by id)
        res.render('/:lng/camp', {});
    });
};
