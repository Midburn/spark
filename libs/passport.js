var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var i18next = require('i18next');

// load up the user model
var User = require('../models/user').User;

var facebookConfig = require('config').get("facebook");

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
        new User({user_id: id}).fetch().then(function (user) {
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
        var user = req.body;
        var userPromise = new User({email: email}).fetch();

        console.log("local-signup Strategy");

        return userPromise.then(function (model) {
            if (model) {
                return done(null, false, req.flash('error', i18next.t('user_exists')));
            } else {
                var userParams = {
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    gender: user.gender
                };
                var newUser = new User(userParams);
                newUser.generateHash(password);
                newUser.generateValidation();

                return newUser.save().then(function () {
                    return done(null, newUser, null);
                });
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
            new User({email: email}).fetch().then(function (data) {
                var user = data;
                if (user === null) {
                    return done(null, false, req.flash('error', i18next.t('invalid_user_password')));
                } else {
                    if (!user.validPassword(password)) {
                        return done(null, false, req.flash('error', i18next.t('invalid_user_password')));
                    } else {
                        if (!user.attributes.validated) {
                            return done(null, false, req.flash('error', i18next.t('user_not_validated', {email: email})));
                        }
                        if (!user.attributes.enabled) {
                            return done(null, false, req.flash('error', i18next.t('user_disabled')));
                        }

                        return done(null, user, null);
                    }
                }
            });
        }));

        // ==========
        // Facebook login
        // ==========
        passport.use(new FacebookStrategy({
            clientID: facebookConfig.app_id,
            clientSecret: facebookConfig.app_secret,
            callbackURL: "http://lvh.me:3000/auth/facebook/callback",
            enableProof: true,
            profileFields: ['id', 'email', 'first_name', 'last_name']
        },
        function(accessToken, refreshToken, profile, cb) {
            if (profile.emails == undefined) {
                // TODO: redirect user to http://lvh.me:3000/auth/facebook/reauth
                console.log("User didn't agree to send us his email. ");
                return cb(null, false);
            }

            User.query({
                where: { facebook_id: profile.id },
                orWhere: { email: profile.emails[0].value }
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
