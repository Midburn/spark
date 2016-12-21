const i18next = require('i18next'),
    recaptcha = require('express-recaptcha'),
    config = require('config'),
    i18nConfig = config.get('i18n'),
    serverConfig = config.get('server'),
    mailConfig = config.get('mail'),
    security = require('../libs/security'),
    mail = require('../libs/mail'),
    log = require('../libs/logger.js')(module)

module.exports = function(app, passport) {

    // ==============
    // Camps Routing
    // ==============
    // camps index page, create new camp
    app.get('/:lng/camps', security.protectGet, (req, res) => {
        res.render('pages/camps/index', {
            user: req.user
        });
    });
    // new camp
    app.get('/:lng/camps/new', security.protectGet, (req, res) => {
        res.render('pages/camps/new', {
            user: req.user,
            camp_name_en: req.query.c
        });
    });
    // camp page (by id)
    app.get('/:lng/camps/:id', security.protectGet, (req, res) => {
        res.render('/:lng/camp', {});
    });
    // camps statistics
    app.get('/:lng/camps-stats', security.protectGet, (req, res) => {
        res.render('pages/camps/stats', {
            user: req.user
        });
    });
};
