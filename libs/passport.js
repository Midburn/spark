var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var i18next = require('i18next');
var User = require('../models/user').User;
var DrupalUser = require('../models/user').DrupalUser;
var facebookConfig = require('config').get("facebook");
var constants = require('../models/constants');



var spark_drupal_gw_login = function (email, password, done) {

    request({
        url: 'https://profile-test.midburn.org/api/user/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        form: { 'username': email, 'password': password }
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log(body);
            var data = JSON.parse(body);
            if (body.indexOf('token') > 0) {
                // user logged in good
                var userPromise = new User({
                    email: email
                }).fetch();
                console.log(body);
                userPromise.then(function (model) {
                    if (model) {
                        done(false, i18next.t('user_exists'));
                    } else {
                        var newUser = new User({
                            email: email,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            gender: user.gender,
                            validated: user.validated
                        });
                        if (password) {
                            newUser.generateHash(password);
                        }
                        if (!user.validated) {
                            newUser.generateValidation();
                        }
                        newUser.save().then(function (model) {
                            done(newUser);
                        });
                    }
                });

                done(newUser);

                // res.status(200).jsonp({ status: 'true', 'massage': 'user authorized', 'data': data });
            }
            else {
                done(false, 'unknown');
            }
        }
        else {
            done(false, 'unknown');
            // res.status(401).jsonp({ status: 'false', 'massage': 'Not authorized!!!' });
        }
    });
}

/***
 * tries to login based on drupal users table
 * once user is successfully logged-in, an automatic sign-up flow is performed which creates a corresponding spark user
 * @param email
 * @param password
 * @param done
 */
var drupal_login = function (email, password, done) {
    DrupalUser.forge({
        name: email
    }).fetch().then(function (drupalUser) {
        if (drupalUser && drupalUser.validPassword(password) && drupalUser.attributes.status === 1) {
            // valid drupal password
            // drupal user status is 1
            // can sign up a spark user with some defaults
            // TODO: get these details from the old profiles system
            signup(email, password, {
                first_name: email,
                last_name: "",
                gender: constants.USER_GENDERS_DEFAULT,
                validated: true
            }, function (newUser, error) {
                if (newUser) {
                    done(newUser);
                } else {
                    done(false, error);
                }
            });
        } else {
            done(false, i18next.t('invalid_user_password'));
        }
    });
};

var login = function (email, password, done) {
    new User({
        email: email
    }).fetch().then(function (user) {
        if (user === null) {
            // no corresponding spark user is found
            // try to get a drupal user - once drupal user is logged-in a corresponding spark user is created
            // on next login - there will be a spark user, so drupal login will not be attempted again
            drupal_login(email, password, done);
        } else if (!user.validPassword(password)) {
            done(false, i18next.t('invalid_user_password'));
        } else if (!user.attributes.validated) {
            done(false, i18next.t('user_not_validated', {
                email: email
            }));
        } else if (!user.attributes.enabled) {
            done(false, i18next.t('user_disabled'));
        } else {
            done(user);
        }
    });
};

var signup = function (email, password, user, done) {
    var userPromise = new User({
        email: email
    }).fetch();
    userPromise.then(function (model) {
        if (model) {
            done(false, i18next.t('user_exists'));
        } else {
            var newUser = new User({
                email: email,
                first_name: user.first_name,
                last_name: user.last_name,
                gender: user.gender,
                validated: user.validated
            });
            if (password) {
                newUser.generateHash(password);
            }
            if (!user.validated) {
                newUser.generateValidation();
            }
            newUser.save().then(function (model) {
                done(newUser);
            });
        }
    });
};

// expose this function to our app using module.exports
module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and deserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        new User({
            user_id: id
        }).fetch().then(function (user) {
            done(null, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
        function (req, email, password, done) {
            signup(email, password, req.body, function (user, error) {
                if (user) {
                    done(null, user, null);
                } else {
                    done(null, false, req.flash('error', error));
                }
            });
        }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, done) {

            login(email, password, function (user, error) {
                if (user) {
                    done(null, user, null);
                } else {
                    done(null, false, req.flash('error', error));
                }
            });
        }));

    // ==========
    // Facebook login
    // ==========
    passport.use(new FacebookStrategy({
        clientID: facebookConfig.app_id,
        clientSecret: facebookConfig.app_secret,
        callbackURL: facebookConfig.callbackBase + "/auth/facebook/callback",
        enableProof: true,
        profileFields: ['id', 'email', 'first_name', 'last_name']
    },
        function (accessToken, refreshToken, profile, cb) {
            if (profile.emails === undefined) {
                // TODO: redirect user to http://lvh.me:3000/auth/facebook/reauth
                console.log("User didn't agree to send us his email. ");
                return cb(null, false);
            }

            User.query({
                where: {
                    facebook_id: profile.id
                },
                orWhere: {
                    email: profile.emails[0].value
                }
            }).fetch().then(function (model) {
                if (model) {
                    // 1. Clear the user's password (the user will now only be
                    //    able to login through FacebookStrategy)
                    // 2. Save updated token and details
                    model.save({
                        password: "",
                        facebook_token: accessToken,
                        facebook_id: profile.id,
                        // I'm not quite sure about this.
                        // If a user changes his Facebook email, should we change
                        // it in our system? I think we should. Not convinced though.
                        email: profile.emails[0].values
                    })
                        .then(function (_model) {
                            return cb(null, model, null);
                        });
                } else {
                    var newUser = new User({
                        facebook_id: profile.id,
                        facebook_token: accessToken,
                        email: profile.emails[0].value,
                        first_name: profile.name.givenName,
                        last_name: profile.name.familyName,
                        gender: profile.gender,
                        validated: true
                    });

                    newUser.save().then(function (model) {
                        return cb(null, newUser, null);
                    });
                }
            });
        }
    ));
};

module.exports.sign_up = function (email, password, user, done) {
    signup(email, password, user, done)
};