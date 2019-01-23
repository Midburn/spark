var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var i18next = require('i18next');
var User = require('../models/user').User;
var config = require('config');
var facebookConfig = config.get('facebook');
var apiTokensConfig = config.get('api_tokens');
var profilesApiConfig = config.get('profiles_api');
var constants = require('../models/constants');
var request = require('superagent');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var passportJWT = require("passport-jwt");
var JwtStrategy = passportJWT.Strategy;
Event = require('../models/event').Event;
/***
 * tries to login based on drupal users table
 * once user is successfully logged-in, an automatic sign-up flow is performed which creates a corresponding spark user
 * @param email
 * @param password
 * @param callback
 */
const drupal_login_request = (email, password, callback) => {
    if (profilesApiConfig.skipDrupalLogin) {
        callback(null);
    } else {
        return request
            .post(profilesApiConfig.url + '/api/user/login')

            // TODO: Workaround for Drupal bug, see https://github.com/Midburn/spark/pull/579 for details
            .send({'username': email.replace('+', ''), 'password': password})

            .set('Accept', 'application/json')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .then(({ body }) => body, () => null)
            .then(function(drupal_user) {
                callback(drupal_user)
            });
    }
};

var login = function (email, password, done) {
    if (!email || !password || email.length === 0 || password.length === 0) {
        console.log('User', email, 'failed to authenticate.');
        done(false, null, i18next.t('invalid_user_password', {
            email: email
        }));
    }

    // Loading user from DB.
    User.forge({email: email}).fetch().then(function (user) {
        if (user) {
            // User found in DB, now checking everything:
            if (!user.attributes.enabled) {
                done(false, user, i18next.t('user_disabled'));
            }
            else if (!user.attributes.validated) {
                done(false, user, i18next.t('user_not_validated'))
            }
            else if (!user.attributes.password || !user.validPassword(password)) {
                done(false, user, i18next.t('invalid_user_password'));
            }
            else {
                // Everything is OK, we're done.
                done(true, user);
            }
        }
        else {
            done(false, null, i18next.t('invalid_user_password'));
        }
    })
};

var drupal_login = function (email, password, done) {
    login(email, password, function (isLoggedIn, user, error) {
        drupal_login_request(email, password, function (drupal_user) {
            if (drupal_user != null) {
                // Drupal update information.
                var drupal_user_id = _.get(drupal_user, 'user.uid');
                if (!drupal_user_id) {
                    done(false, i18next.t('invalid_user_id'));
                } else {
                    var tickets = drupal_user.user.data.tickets.tickets;
                    var current_event_tickets_count = 0;
                    var tickets_array = [];

                    _.each(tickets, (ticket, ticket_id) => {
                        if (ticket.trid) {
                            var _ticket = {
                                trid: ticket.trid,
                                user_uid: ticket.user_uid,
                                bundle: ticket.bundle,
                                barcode: _.get(ticket, 'field_ticket_barcode.und.0.value', ''),
                                serial_id: _.get(ticket, 'field_ticket_serial_id.und.0.value', '')
                            };
                            _ticket.is_mine = (_ticket.user_uid === drupal_user_id);
                            if (constants.events[constants.DEFAULT_EVENT_ID].bundles.indexOf(_ticket.bundle) > -1) {
                                _ticket.event_id = constants.DEFAULT_EVENT_ID;
                                if (_ticket.is_mine) {
                                    current_event_tickets_count++;
                                }
                            }
                            tickets_array.push(_ticket);
                        }
                    });

                    var drupal_details = {
                        created_at: (new Date(parseInt(_.get(drupal_user, 'user.created', 0)) * 1000)).toISOString().substring(0, 19).replace('T', ' '),
                        updated_at: (new Date()).toISOString().substring(0, 19).replace('T', ' '),
                        first_name: _.get(drupal_user, 'user.field_profile_first.und.0.value', ''),
                        last_name: _.get(drupal_user, 'user.field_profile_last.und.0.value', ''),
                        cell_phone: _.get(drupal_user, 'user.field_profile_phone.und.0.value', ''),
                        address: _.get(drupal_user, 'user.field_profile_address.und.0.thoroughfare', '') + ' ' + _.get(drupal_user, 'user.field_profile_address.und.0.locality', '') + ' ' + _.get(drupal_user, 'user.field_profile_address.und.0.country', ''),
                        israeli_id: _.get(drupal_user, 'user.field_field_profile_document_id.und.0.value', ''),
                        date_of_birth: _.get(drupal_user, 'user.field_profile_birth_date.und.0.value', ''),
                        gender: _.get(drupal_user, 'user.field_sex.und.0.value', constants.USER_GENDERS_DEFAULT).toLowerCase(),
                        current_event_id_ticket_count: current_event_tickets_count,
                        validated: true
                    };

                    var details_json_data = {
                        address: {
                            first_name: _.get(drupal_user, 'user.field_profile_address.und.0.first_name', ''),
                            last_name: _.get(drupal_user, 'user.field_profile_address.und.0.last_name', ''),
                            street: _.get(drupal_user, 'user.field_profile_address.und.0.thoroughfare', ''),
                            city: _.get(drupal_user, 'user.field_profile_address.und.0.locality', ''),
                            country: _.get(drupal_user, 'user.field_profile_address.und.0.country', '')
                        },
                        foreign_passport: _.get(drupal_user, 'user.field_profile_address.und.0.country', '')
                    };

                    var addinfo_json = {};
                    if (user && typeof user.attributes.addinfo_json === 'string') {
                        addinfo_json = JSON.parse(user.attributes.addinfo_json);
                    }
                    addinfo_json.drupal_data = details_json_data;
                    addinfo_json.tickets = tickets_array;
                    drupal_details.addinfo_json = JSON.stringify(addinfo_json);

                    if (user === null) {
                        signup(email, password, drupal_details, function (newUser, error) {
                            if (newUser) {
                                done(newUser);
                            } else {
                                done(false, error);
                            }
                        })
                    }
                    else {
                        // we are now updating user data every login
                        // to fetch latest user information. very important is to know
                        // that once spark will be the main system, this all should be removed!
                        user.save(drupal_details).then((user) => {
                            done(user);
                        });

                        console.log('User', email, 'authenticated successfully in Drupal and synchronized to Spark.');
                    }
                }
            }
            else {
                if (isLoggedIn) {
                    done(user);
                }
                else {
                    done(false, i18next.t('invalid_user_password'));
                }
            }
        });
    });
};

var signup = function (email, password, user, done) {
    var userPromise = new User({
        email: email
    }).fetch();
    userPromise.then(function (model) {
        if (model) {
            done(false, i18next.t('user_exists'))
        } else {
            var newUser = new User({
                email: email,
                first_name: user.first_name,
                last_name: user.last_name,
                gender: user.gender,
                validated: user.validated,
                cell_phone: user.cell_phone
            });
            if (password) {
                newUser.generateHash(password)
            }
            if (!user.validated) {
                newUser.generateValidation()
            }
            newUser.save().then(function (model) {
                done(newUser)
            })
        }
    })
};

var generateJwtToken = function (email, eventId) {
    // from now on we'll identify the user by the email and the email
    // is the only personalized value that goes into our token
    let _eventId = eventId || constants.DEFAULT_EVENT_ID
    let payload = { email: email };
    let token = jwt.sign(payload, apiTokensConfig.token);
    let userData = { token, currentEventId: _eventId }
    return userData;
};

// expose this function to our app using module.exports
module.exports = function (passport) {
    // =========================================================================
    // passport session setup
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and deserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        //add the user id and the current event id to the session

        if (user.currentEventId === undefined) {
            user.currentEventId = constants.DEFAULT_EVENT_ID;
        }
        let userData = {user_id: user.id, currentEventId: user.currentEventId}
        done(null, userData)
    });

    // used to deserialize the user
    passport.deserializeUser(function (userData, done) {
        new User({
            user_id: userData.user_id
        }).fetch().then(function (user) {
            if (userData.currentEventId === undefined) {
                userData.currentEventId = constants.DEFAULT_EVENT_ID
            }
            //restore the current event id from the session
            user.currentEventId = userData.currentEventId
            done(null, user)
            })
    });

    // =========================================================================
    // LOCAL SIGNUP
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
                    done(null, user, null)
                } else {
                    done(null, false, req.flash('error', error))
                }
            })
        }));

    // =========================================================================
    // LOCAL LOGIN
    // =========================================================================
    passport.use('local-login', new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, done) {
            drupal_login(email, password, function (user, error) {
                if (user) {
                    done(null, user, null)
                } else {
                    done(null, false, req.flash('error', error))
                }
            })
        }));

    // =========================================================================
    // JWT authentication
    // =========================================================================
    var jwtOptions = {};
    jwtOptions.secretOrKey = apiTokensConfig.token;
    jwtOptions.jwtFromRequest = function(req) {
        var token = null;
        if (req && req.cookies)
        {
            token = req.cookies['authToken'];
        }
        return token;
    };

    passport.use(new JwtStrategy(jwtOptions, function (jwt_payload, next) {
        console.log('JWT payload received', jwt_payload);
        var email = jwt_payload.token.email;

        new User({
            email: email
        }).fetch().then(function (user) {
                if (user) {
                    //set the user the current event id from the session
                    user.currentEventId = jwt_payload.currentEventId
                    next(null, user);
                } else {
                    next(null, false);
                }
            });
    }));

    // =========================================================================
    // Facebook login
    // =========================================================================
    passport.use(new FacebookStrategy({
            clientID: facebookConfig.app_id,
            clientSecret: facebookConfig.app_secret,
            callbackURL: facebookConfig.callbackBase + '/auth/facebook/callback',
            enableProof: true,
            profileFields: ['id', 'email', 'first_name', 'last_name']
        },
        function (accessToken, refreshToken, profile, cb) {
            if (profile.emails === undefined) {
                // TODO: redirect user to http://lvh.me:3000/auth/facebook/reauth
                console.log("User didn't agree to send us his email. ");
                return cb(null, false)
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
                        password: '',
                        facebook_token: accessToken,
                        facebook_id: profile.id,
                        // I'm not quite sure about this.
                        // If a user changes his Facebook email, should we change
                        // it in our system? I think we should. Not convinced though.
                        email: profile.emails[0].values
                    })
                        .then(function (_model) {
                            return cb(null, model, null)
                        })
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
                        return cb(null, newUser, null)
                    })
                }
            })
        }
    ))
};

module.exports.sign_up = function (email, password, user, done) {
    signup(email, password, user, done)
};

module.exports.login = login;
module.exports.generateJwtToken = generateJwtToken;
