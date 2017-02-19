var config = require('config');
var i18nConfig = config.get('i18n');
var ticket_routes = require('./ticket_routes');
var userRole = require('../modules/users/libs/user_role');

module.exports = function (app, passport) {

    // =====================================
    // INDEX PAGE ==========================
    // =====================================
    app.get('/', userRole.isLoggedIn(), function (req, res) {
        res.redirect('/he/home');
    });

    app.get('/:lng/', function (req, res, next) {
        if (i18nConfig.languages.indexOf(req.params.lng) > -1) {
            res.redirect('/' + req.params.lng + '/login');
        } else {
            res.status(404);
            next();
        }
    });

    app.get('/:lng/home', userRole.isLoggedIn(), function (req, res) {
        res.render('pages/home', {
            user: req.user
        });
    });

    // OAuth
    app.get('/auth/facebook',
        passport.authenticate('facebook', {
            scope: ['email']
        }));

    app.get('/auth/facebook/reauth',
        passport.authenticate('facebook', {
            authType: 'rerequest',
            scope: ['email']
        }));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            failureRedirect: '/'
        }),
        function (req, res, c) {
            // Successful authentication, redirect home.
            res.redirect('/');
        });

    app.use('/:language/tickets/', ticket_routes);

};
