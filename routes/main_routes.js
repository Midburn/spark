var i18next = require('i18next');
var recaptcha = require('express-recaptcha');
var config = require('config');
var i18nConfig = config.get('i18n');
var serverConfig = config.get('server');
var mailConfig = config.get('mail');
var recaptchaConfig = config.get('recaptcha');
const breadcrumbs = require('express-breadcrumbs');
constants = require('../models/constants.js');
Event = require('../models/event').Event;

var mail = require('../libs/mail');
var log = require('../libs/logger.js')(module);
var User = require('../models/user').User;
var userRole = require('../libs/user_role');
var passportLib = require('../libs/passport');

var async = require('async');
var crypto = require('crypto');

module.exports = function (app, passport) {
    // Use locals
    app.locals.moment = require('moment');
    // Breadcrumbs
    app.use(breadcrumbs.init());

    userRole.failureHandler = function (req, res, role) {
        if (req.url !== '/') {
            // set 403 status for any page which failed auth except homepage
            res.status(403);
        }
        res.redirect('/' + (req.params.lng || 'he') + '/login?r=' + req.url);
    };

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
        req.breadcrumbs({
            name: 'breadcrumbs.home',
            url: '/' + req.params.lng + '/home'
        });
        //fetch all events to set in the midburn dropdown
        Event.fetchAll().then(async (events) => {
            const currentEventRules = await Event.get_event_controllDates(req.user.currentEventId) || {};
            res.render('pages/home', {
                user: req.user,
                events: events.toJSON(),
                isAdmin: req.user.isAdmins,
                currentEventRules: currentEventRules,
                breadcrumbs: req.breadcrumbs()
            });
        });
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    var loginPost = function (req, res, next) {
        if (req.body.email.length === 0 || req.body.password.length === 0) {
            return res.render('pages/login', {
                errorMessage: i18next.t('invalid_user_password')
            });
        }

        passport.authenticate('local-login', {
            failureFlash: true
        }, function (err, user, info) {
            if (err) {
                return res.render('pages/login', {
                    errorMessage: err.message
                });
            }

            if (!user) {
                return res.render('pages/login', {
                    errorMessage: req.flash('error')
                });
            }
            return req.logIn(user, function (err) {
                if (err) {
                    return res.render('pages/login', {
                        errorMessage: req.flash('error')
                    });
                } else {
                    const cookieOptions = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging' ?
                        { httpOnly: true, domain: constants.MIDBURN_DOMAIN } : { httpOnly: true }
                    res.cookie('authToken', passportLib.generateJwtToken(req.body.email), cookieOptions);
                    var r = req.body['r'];
                    if (r && constants.LOGIN_REDIRECT_URL_WHITELIST.indexOf(r) > 0) {
                        return res.redirect(r);
                    } else {
                        return res.redirect('home');
                    }
                }
            });
        })(req, res, next);
    };

    // process the login form
    app.post('/:lng/login', loginPost);

    // show the login form
    app.get('/:lng/login', function (req, res) {
        var r = req.query.r;
        res.render('pages/login', {
            errorMessage: req.flash('error'),
            r: r
        });
    });

    // =====================================
    // OAuth ===============================
    // =====================================
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

    // =====================================
    // JWT =================================
    // =====================================
    // JWT Login route
    app.post("/jwt-login", function (req, res) {
        passportLib.login(req.body.email, req.body.password, function (result, user, error) {
            if (result && user) {
                var token = passportLib.generateJwtToken(req.body.email);
                res.json({ message: "ok", token: token });
            }
            else {
                res.status(401).json({ message: error });
            }
        });
    });

    // =====================================
    // SIGNUP ==============================
    // =====================================
    var _renderSignup = function (res, req) {
        return res.render('pages/signup', {
            errorMessage: req.flash('error'),
            body: req.body, //repopulate fields in case of error
            recaptcha_sitekey: recaptchaConfig.sitekey
        });
    };

    var _renderSignupError = function (res, req, error) {
        return res.render('pages/signup', {
            errorMessageResource: error,
            body: req.body, //repopulate fields in case of error
            recaptcha_sitekey: recaptchaConfig.sitekey
        });
    };

    var signUpPost = function (req, res, next) {
        recaptcha.verify(req, function (err) { //TODO turn to middleware or promises to minimize clutter
            if (err && !recaptchaConfig.ignore) {
                return _renderSignupError(res, req, 'only_humans_allowed');
            } else {
                passport.authenticate('local-signup', {
                    failureFlash: true
                }, function (err, user, info) {
                    if (err) {
                        return _renderSignupError(res, req, req.flash(err.message));
                    }

                    if (!user) {
                        return _renderSignupError(res, req, req.flash('error'));
                    }

                    return req.logIn(user, function (err) {
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
                            return _renderSignupError(res, req, req.flash('error'));
                        }
                    });
                })(req, res, next);
            }
        });
    };

    // show the signup form
    app.get('/:lng/signup', function (req, res) {
        // render the page and pass in any flash data if it exists
        return _renderSignup(res, req);
    });

    // process the signup form
    app.post('/:lng/signup', signUpPost);

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/:lng/logout', function (req, res) {
        req.logout();
        res.cookie('authToken', '', { expires: new Date(0), overwrite: true });
        res.redirect('/');
    });

    // =====================================
    // Who-am-i show user's details
    // =====================================
    app.get('/:lng/whoami', (req, res) => {
        req.breadcrumbs([{
            name: 'breadcrumbs.home',
            url: '/' + req.params.lng + '/home'
        },
        {
            name: 'breadcrumbs.whoami',
            url: '/' + req.params.lng + '/whoami'
        }]);

        /* TODO - camp fetching here is incorrect.
         * We don't have only one event with one camp!
         * We need to iterate on all events and change the view to be a better solution. */

        req.user.getUserCamps((camps) => {
            let data = {
                user: req.user,
                // camp: req.user.attributes.camp,
                breadcrumbs: req.breadcrumbs()
            };
            let camp = req.user.attributes.camp;
            if (camp) {
                camp.camp_name = (req.lng === "he") ? camp.camp_name_he : camp.camp_name_en;
                camp.camp_desc = (req.lng === "he") ? camp.camp_desc_he : camp.camp_desc_en;
                data.camp = camp;
            }
            res.render('pages/whoami', data);
        }, req.t);
    });

    // =====================================
    // RESET PASSWORD ======================
    // =====================================
    // Consists of two distinct views,
    // forgot password for requesting a password reset,
    // and reset password for setting a new password

    app.get('/:lng/reset_password', function (req, res) {
        res.render('pages/reset_password', {
            user: req.user
        });
    });

    //TODO reuse or move logic into user.js
    function generateExpirationString() {
        var date = new Date();
        var offset = (24 * 60 * 60 * 1000); // hours*minutes*seconds*millis
        date.setTime(date.getTime() + offset);
        res = date.toISOString().slice(0, 19).replace('T', ' ');
        console.log('epiration date: ', res);
        return res;
    }

    var resetPasswordPost = function (req, res, next) {
        async.waterfall([
            function (done) {
                new User({
                    email: req.body.email
                })
                    .fetch()
                    .then(function (model) {
                        if (model === null) {
                            return done(i18next.t('email_doesnt_exist_message'));
                        }
                        return done(null, model);
                    });
            },
            function (model, done) {
                console.log("entering crypto");
                //TODO reuse or move logic into user.js
                crypto.randomBytes(20, function (err, buf) {
                    var token = buf
                        .toString('base64')
                        .replace(/\+/g, '0')
                        .replace(/\//g, '0');
                    console.log(token);
                    done(err, model, token);
                });
            },
            function (model, token, done) {
                model
                    .save({
                        reset_password_token: token,
                        reset_password_expires: generateExpirationString()
                    }, {
                        patch: true
                    })
                    .then(function (model) {
                        return done(null, model);
                    });
                //TODO catch Bookshelf exception here
            },
            function (model, done) {
                var link =
                    serverConfig.url + '/' +
                    req.params.lng +
                    "/confirm_password_reset/" +
                    model.attributes.reset_password_token;

                mail.send(
                    model.attributes.email,
                    mailConfig.from,
                    i18next.t('reset_password_email_subject'),
                    'emails/reset_password', { //TODO - not exists!
                        name: model.fullName,
                        link: link
                    });

                // return done(mailsent ? null : 'Error sending mail');
                //TODO motenko: mail.send ins't implemented for returning errors
                //Fix mail.send to have idiomatic Node.js callback with error
                return done(null);
            }
        ],
            function (err) {
                if (err) {
                    res.render('pages/reset_password', {
                        errorMessage: err
                    });
                } else {
                    res.render('pages/reset_password', {
                        successMessage: i18next.t('reset_password_email_sent')
                    });
                }
            });
    };

    app.post('/:lng/reset_password', resetPasswordPost);

    app.get('/:lng/confirm_password_reset/:token', function (req, res) {
        console.log('resetting password');
        new User({
            reset_password_token: req.params.token
        })
            .fetch()
            .then(function (model) {
                if (model === null ||
                    //no such token or token expired
                    (new Date(model.attributes.reset_password_expires))
                        .getTime() < Date.now()) {
                    return res.render('pages/confirm_password_reset', {
                        errorMessage: i18next.t('bad_or_expired_token')
                    });
                }
                return res.render('pages/confirm_password_reset', {
                    token: req.params.token
                });
            });
    });

    app.post('/:lng/finalize_password_reset/:token', function (req, res) {
        console.log('finalize password reset');

        if (req.body.password !== req.body.confirm_password) {
            //shouldn't happen because of server side validation
            return res.render('pages/confirm_password_reset', {
                errorMessage: ""
            });
        }

        async.waterfall([
            function (done) {
                new User({
                    reset_password_token: req.params.token
                })
                    .fetch()
                    .then(function (model) {
                        if (model === null ||
                            //no such token or token expired
                            (new Date(model.attributes.reset_password_expires))
                                .getTime() < Date.now()) {
                            return done(i18next.t('bad_or_expired_token'));
                        }
                        return done(null, model);
                    });
            },
            function (model, done) {
                //create new pasasword hash
                model.generateHash(req.body.password);

                //invalidate token and expiration
                model.attributes.reset_password_expires = null;
                model.attributes.reset_password_token = null;

                model.save().then(function (model) {
                    return done(null, model);
                });
            },
            function (model, done) {
                mail.send(
                    model.attributes.email,
                    mailConfig.from,
                    i18next.t('password_changed_email_subject'),
                    'emails/password_changed', {
                        name: model.fullName
                    });
                return done(null);
            }
        ],
            function (err) {
                if (err) {
                    res.render('pages/confirm_password_reset', {
                        errorMessage: err
                    });
                } else {
                    res.render('pages/confirm_password_reset', {
                        successMessage: i18next.t('password_reset_succeeded')
                    });
                }
            });
    });

    app.get('/:lng/validate_email/:token', function (req, res) {
        var token = req.params.token;
        log.info('Received email validation token: ' + token);

        new User({
            email_validation_token: token
        }).fetch().then(function (user) {
            if (user.validate()) {
                user.save().then(function () {
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
