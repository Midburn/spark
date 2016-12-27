// To compile .JSX files
require('babel-register')({
    presets: ['react']
});

const i18next = require('i18next'),
    recaptcha = require('express-recaptcha'),
    config = require('config'),
    i18nConfig = config.get('i18n'),
    serverConfig = config.get('server'),
    mailConfig = config.get('mail'),
    security = require('../libs/security'),
    mail = require('../libs/mail'),
    log = require('../libs/logger.js')(module),
    breadcrumbs = require('express-breadcrumbs');

var React = require('react'),
    ReactDOMServer = require('react-dom/server'),
    Component = require('../Component.jsx');

var Camp = require('../models/camp').Camp,
    User = require('../models/user').User;

module.exports = function(app, passport) {
    // Breadcrumbs
    app.use(breadcrumbs.init());
    // ==============
    // Camps Routing
    // ==============
    // camps index page, create new camp
    app.get('/:lng/camps', security.protectGet, (req, res) => {
        app.use(breadcrumbs.setHome());
        req.breadcrumbs('camps-index');
        res.render('pages/camps/index', {
            user: req.user,
            breadcrumbs: req.breadcrumbs()
        });
    });
    // new camp
    app.get('/:lng/camps/new', security.protectGet, (req, res) => {
        res.render('pages/camps/new', {
            user: req.user,
            camp_name_en: req.query.c
        });
    });
    // camps statistics
    app.get('/:lng/camps-stats', security.protectGet, (req, res) => {
        req.breadcrumbs('statistics');
        res.render('pages/camps/stats', {
            user: req.user,
            breadcrumbs: req.breadcrumbs()
        });
    });
    // camp details page (by id)
    app.get('/:lng/camps/:id', security.protectGet, (req, res) => {
        Camp
            .forge({
                id: req.params.id
            })
            .fetch()
            .then((camp) => {
                User.forge({
                    user_id: camp.toJSON().main_contact
                }).fetch().then((user) => {
                    res.render('pages/camps/camp', {
                        user: req.user,
                        id: req.params.id,
                        camp_management: user.toJSON(),
                        camp: camp.toJSON()
                    });
                });
            })
            .catch((e) => {
                res.status(500).json({
                    error: true,
                    data: {
                        message: e.message
                    }
                });
            });
    });
    // Edit
    app.get('/:lng/camps/:id/edit', security.protectGet, (req, res) => {
        Camp
            .forge({
                id: req.params.id
            })
            .fetch()
            .then((camp) => {
                res.render('pages/camps/edit', {
                    user: req.user,
                    camp: camp.toJSON()
                })
            })
    });
    // Remove
    app.get('/:lng/camps/:id/remove', security.protectGet, (req, res) => {
        Camp
            .forge({
                id: req.params.id
            })
            .fetch({
                require: true
            })
            .then((camp) => {
                camp.destroy()
                    .then(() => {
                        res.render('pages/camps/stats', {
                            user: req.user
                        });
                    })
                    .catch(function(err) {
                        res.status(500).json({
                            error: true,
                            data: {
                                message: err.message
                            }
                        });
                    });
            });
    });
    // React rendered camp list
    app.get('/:lng/react', (req, res) => {
        var HTML = ReactDOMServer.renderToString(
            React.createElement(Component)
        );
        res.send(HTML);
    });
};
