var LocalStrategy = require('passport-local').Strategy;
var i18next = require('i18next');

// load up the user model
var User = require('../models/user').User;

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
        })
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
            var usernamePromise = new User({email: email}).fetch();

            return usernamePromise.then(function (model) {
                if (model) {
                    return done(null, false, req.flash('error', i18next.t('user_exists')));
                } else {
                    var newUser = new User({email: email, first_name: user.first_name, last_name: user.last_name, gender: user.gender});
                    newUser.generateHash(password);

                    newUser.save().then(function (model) {
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
                    return done(null, false, req.flash('error', 'Invalid username or password'));
                } else {
                    if (!user.validPassword(password)) {
                        //return done(null, false, req.flash('errorMessage', 'Invalid username or password'));
                        return done(null, false, req.flash('error', 'Invalid username or password'));
                    } else {

                        //TODO check here that the user is enabled and activated.

                        return done(null, user, null);
                    }
                }
            });
        }));
}
;