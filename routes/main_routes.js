var i18next = require('i18next');
var recaptcha = require('express-recaptcha');
var config = require('config');
var i18nConfig = config.get('i18n');
var serverConfig = config.get('server');
var mailConfig = config.get('mail');
var security = require('../libs/security');
var mail = require('../libs/mail');
var User = require('../models/user').User;
var log = require('../libs/logger.js')(module);
var ticket_routes = require('./ticket_routes');

module.exports = function(app, passport) {

    // =====================================
    // INDEX PAGE (renders to login) =======
    // =====================================
    app.get('/', function(req, res) {
        if (req.isAuthenticated()) {
            res.redirect('/he/home');
        } else {
            res.redirect('/he/login');
        }
    });

    app.get('/:lng/', function(req, res, next) {
        if (i18nConfig.languages.indexOf(req.params.lng) > -1) {
            res.redirect('/' + req.params.lng + '/login');
        } else {
            res.status(404);
            next();
        }
    });

    app.get('/:lng/home', security.protectGet, function(req, res) {
        res.render('pages/home', {
            user: req.user
        });
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    var loginPost = function(req, res, next) {
        if (req.body.email.length == 0 || req.body.password.length == 0) {
            return res.render('pages/login', {
                errorMessage: i18next.t('invalid_user_password')
            });
        }

        passport.authenticate('local', {
            failureFlash: true,
            failureRedirect: '/login'
        }, function(req, res, next) {
            if (!req.body.remember) {
                return next();
            }
        }, function(req, res) {
            res.redirect('/');
        });
    };

    // process the login form
    app.post('/:lng/login', loginPost);

    // Remember me
    // app.use(passport.authenticate('remember-me'));

    // passport.use(new RememberMeStrategy(
    //     function(token, done) {
    //         Token.consume(token, function(err, user) {
    //             if (err) {
    //                 return done(err);
    //             }
    //             if (!user) {
    //                 return done(null, false);
    //             }
    //             return done(null, user);
    //         });
    //     },
    //     function(user, done) {
    //         var token = utils.generateToken(64);
    //         Token.save(token, {
    //             userId: user.id
    //         }, function(err) {
    //             if (err) {
    //                 return done(err);
    //             }
    //             return done(null, token);
    //         });
    //     }
    // ));

    // show the login form
    app.get('/:lng/login', function(req, res) {
        var r = req.query.r;
        res.render('pages/login', {
            errorMessage: req.flash('error'),
            r: r
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
        function(req, res, c) {
            // Successful authentication, redirect home.
            res.redirect('/');
        });

    app.use('/:language/tickets/', ticket_routes);
    // =====================================
    // SIGNUP ==============================
    // =====================================
    var signUpPost = function(req, res, next) {
        recaptcha.verify(req, function(err) { //TODO turn to middleware or promises to minimize clutter
            if (err) {
                return res.render('pages/signup', {
                    errorMessageResource: 'only_humans_allowed',
                    body: req.body //repopulate fields in case of error
                });
            } else {
                passport.authenticate('local-signup', {
                    failureFlash: true
                }, function(err, user, info) {
                    if (err) {
                        res.render('pages/signup', {
                            errorMessage: req.flash(err.message),
                            body: req.body //repopulate fields in case of error
                        });
                    }

                    if (!user) {
                        return res.render('pages/signup', {
                            errorMessage: req.flash('error'),
                            body: req.body //repopulate fields in case of error
                        });
                    }

                    return req.logIn(user, function(err) {
                        if (!err) {
                            // Send validation email.
                            var link = serverConfig.url + '/' + req.params.lng +
                                "/validate_email/" + user.attributes.email_validation_token;

                            mail.send(
                                user.attributes.email,
                                mailConfig.from,
                                'Spark email validation!',
                                'emails/email_validation', {
                                    name: user.fullName,
                                    link: link
                                });

                            res.render('pages/login', {
                                successMessageResource: 'email_verification_required'
                            });

                        } else {
                            res.render('pages/signup', {
                                errorMessage: req.flash('error'),
                                body: req.body //repopulate fields in case of error
                            });
                        }
                    });
                })(req, res, next);
            }
        });


    };

    // show the signup form
    app.get('/:lng/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('pages/signup', {
            errorMessage: req.flash('error')
        });
    });

    // process the signup form
    app.post('/:lng/signup', signUpPost);

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/:lng/logout', function(req, res) {
        res.clearCookie('remember_me');
        req.logout();
        res.redirect('/');
    });

    // =====================================
    // RESET PASSWORD ======================
    // =====================================
    var resetPasswordPost = function(req, res) {
        // TODO - implement
        // Tutorial is here: http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/
        // (start at the "forgot" stuff, login/out/sign are already implemented).

        res.render('pages/reset_password', {
            errorMessage: 'NOT IMPLEMENTED'
        });
    };

    app.get('/:lng/reset_password', function(req, res) {
        res.render('pages/reset_password', {
            errorMessage: req.flash('error')
        });
    });

    app.post('/:lng/reset_password', resetPasswordPost);


    app.get('/:lng/validate_email/:token', function(req, res) {
        var token = req.params.token;
        log.info('Received email validation token: ' + token);

        new User({
            email_validation_token: token
        }).fetch().then(function(user) {
            if (user.validate()) {
                user.save().then(function() {
                    res.render('pages/login', {
                        successMessage: i18next.t('email_verified')
                    });
                });
            } else {
                res.sendStatus(400);
            }
        });
    });
};
