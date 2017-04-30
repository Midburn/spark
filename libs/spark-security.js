// const LocalStrategy = require('passport-local').Strategy;
// const FacebookStrategy = require('passport-facebook').Strategy;
// const User = require('../models/user').User;
// const config = require('config');
// const passport = require('passport');
// const facebookConfig = config.get('facebook');
// const apiTokensConfig = config.get('api_tokens');
// const jwt = require('jwt-simple');
// const passportJWT = require("passport-jwt");
// const ExtractJwt = passportJWT.ExtractJwt;
// const JwtStrategy = passportJWT.Strategy;
// const users = require('./users');
//
// const generateJwtToken = session => {
//     // from now on we'll identify the user by the email and the email
//     // is the only personalized value that goes into our token
//     // var payload = {email: email};
//     console.log(jwt.encode(session, apiTokensConfig.token));
//     return jwt.encode(session, apiTokensConfig.token);
// };
//
// const init = app => {
//
//     // =========================================================================
//     // JWT authentication
//     // =========================================================================
//     const jwtOptions = {
//         jwtFromRequest: ExtractJwt.fromAuthHeader(),
//         secretOrKey: apiTokensConfig.token
//     };
//
//     passport.use(new JwtStrategy(jwtOptions, (token, next) => {
//         console.log('JWT payload received', token);
//         const email = token.email;
//
//         new User({email: email}).fetch()
//             .then(user => {
//                 if (user) {
//                     next(null, user);
//                 } else {
//                     next(null, false);
//                 }
//             });
//     }));
//
//     // var strategy = new Strategy(params, function(payload, done) {
//     //     var user = users[payload.id] || null;
//     //     if (user) {
//     //         return done(null, {
//     //             id: user.id
//     //         });
//     //     } else {
//     //         return done(new Error("User not found"), null);
//     //     }
//     // });
//     // passport.use(strategy);
//     // return {
//     //     initialize: function() {
//     //         return passport.initialize();
//     //     },
//     //     authenticate: function() {
//     //         return passport.authenticate("jwt", cfg.jwtSession);
//     //     }
//     // };
//
//     // using session storage in DB - allows multiple server instances + cross session support between node js apps
// // var sessionStore = new KnexSessionStore({
// //     knex: knex
// // });
// // app.use(session({
// //     secret: 'SparklePoniesAreFlyingOnEsplanade',
// //     resave: false,
// //     saveUninitialized: false,
// //     maxAge: 1000 * 60 * 30,
// //     store: sessionStore
// // }));
//     app.use(passport.initialize());
// // app.use(passport.session()); // persistent login sessions
//
//     app.use((req, res, next) => {
//         console.log('middleware !!!!!');
//         // if (!_.isUndefined(req.cookies[SessionCookieName])) {
//         //     try {
//         //         req.sparkSession = sparkSessionCrypto.decrypt(req.cookies[SessionCookieName]);
//         //     } catch (err) {
//         //         console.log('validation failed');
//         //         delete req.sparkSession;
//         //     }
//         // }
//         next();
//     });
// };
//
// // expose this function to our app using module.exports
// module.exports = function (passport) {
//     // =========================================================================
//     // passport session setup
//     // =========================================================================
//     // required for persistent login sessions
//     // passport needs ability to serialize and deserialize users out of session
//
//     // used to serialize the user for the session
//     passport.serializeUser(function (user, done) {
//         done(null, user.id)
//     });
//
//     // used to deserialize the user
//     passport.deserializeUser(function (id, done) {
//         new User({
//             user_id: id
//         }).fetch().then(function (user) {
//                 done(null, user)
//             })
//     });
//
//     // =========================================================================
//     // LOCAL SIGNUP
//     // =========================================================================
//     passport.use('local-signup', new LocalStrategy({
//             // by default, local strategy uses username and password, we will override with email
//             usernameField: 'email',
//             passwordField: 'password',
//             passReqToCallback: true // allows us to pass back the entire request to the callback
//         },
//         function (req, email, password, done) {
//             users.signup(email, password, req.body, function (user, error) {
//                 if (user) {
//                     done(null, user, null)
//                 } else {
//                     done(null, false, req.flash('error', error))
//                 }
//             })
//         }));
//
//     // =========================================================================
//     // LOCAL LOGIN
//     // =========================================================================
//     passport.use('local-login', new LocalStrategy(
//         {
//             usernameField: 'email',
//             passwordField: 'password',
//             passReqToCallback: true
//         },
//         function (req, email, password, done) {
//             users.drupal_login(email, password, function (user, error) {
//                 if (user) {
//                     done(null, user, null)
//                 } else {
//                     done(null, false, req.flash('error', error))
//                 }
//             })
//         }));
//
//     // =========================================================================
//     // JWT authentication
//     // =========================================================================
//     const jwtOptions = {
//         jwtFromRequest: ExtractJwt.fromAuthHeader(),
//         secretOrKey: apiTokensConfig.token
//     };
//
//     passport.use(new JwtStrategy(jwtOptions, (token, next) => {
//         console.log('JWT payload received', token);
//         const email = token.email;
//
//         new User({email: email}).fetch()
//                                 .then(user => {
//                                     if (user) {
//                                         next(null, user);
//                                     } else {
//                                         next(null, false);
//                                     }
//                                 });
//     }));
//
//     // =========================================================================
//     // Facebook login
//     // =========================================================================
//     passport.use(new FacebookStrategy({
//             clientID: facebookConfig.app_id,
//             clientSecret: facebookConfig.app_secret,
//             callbackURL: facebookConfig.callbackBase + '/auth/facebook/callback',
//             enableProof: true,
//             profileFields: ['id', 'email', 'first_name', 'last_name']
//         },
//         function (accessToken, refreshToken, profile, cb) {
//             if (profile.emails === undefined) {
//                 // TODO: redirect user to http://lvh.me:3000/auth/facebook/reauth
//                 console.log("User didn't agree to send us his email. ");
//                 return cb(null, false)
//             }
//
//             User.query({
//                 where: {
//                     facebook_id: profile.id
//                 },
//                 orWhere: {
//                     email: profile.emails[0].value
//                 }
//             }).fetch().then(function (model) {
//                 if (model) {
//                     // 1. Clear the user's password (the user will now only be
//                     //    able to login through FacebookStrategy)
//                     // 2. Save updated token and details
//                     model.save({
//                         password: '',
//                         facebook_token: accessToken,
//                         facebook_id: profile.id,
//                         // I'm not quite sure about this.
//                         // If a user changes his Facebook email, should we change
//                         // it in our system? I think we should. Not convinced though.
//                         email: profile.emails[0].values
//                     })
//                         .then(function (_model) {
//                             return cb(null, model, null)
//                         })
//                 } else {
//                     var newUser = new User({
//                         facebook_id: profile.id,
//                         facebook_token: accessToken,
//                         email: profile.emails[0].value,
//                         first_name: profile.name.givenName,
//                         last_name: profile.name.familyName,
//                         gender: profile.gender,
//                         validated: true
//                     });
//
//                     newUser.save().then(function (model) {
//                         return cb(null, newUser, null)
//                     })
//                 }
//             })
//         }
//     ))
// };
//
// const SessionCookieName = 'spark_session';
//
// module.exports = {generateJwtToken, SessionCookieName, init};
