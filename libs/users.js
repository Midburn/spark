// var LocalStrategy = require('passport-local').Strategy;
// var FacebookStrategy = require('passport-facebook').Strategy;
const i18next = require('i18next');
var User = require('../models/user').User;
// var config = require('config');
// var facebookConfig = config.get('facebook');
// var apiTokensConfig = config.get('api_tokens');
// var constants = require('../models/constants');
// var request = require('superagent');
// var _ = require('lodash');
// var jwt = require('jsonwebtoken');
// var passportJWT = require("passport-jwt");
// var ExtractJwt = passportJWT.ExtractJwt;
// var JwtStrategy = passportJWT.Strategy;

/***
 * tries to login based on drupal users table
 * once user is successfully logged-in, an automatic sign-up flow is performed which creates a corresponding spark user
 * @param email
 * @param password
 * @param done
 */
// const drupal_login_request = (email, password) =>
//     request
//     // .post('https://profile-test.midburn.org/api/user/login')
//         .post('https://profile.midburn.org/api/user/login')
//         .send({'username': email, 'password': password})
//         .set('Accept', 'application/json')
//         .set('Content-Type', 'application/x-www-form-urlencoded')
//         .then(({ body }) => body, () => null);

const login = function (email, password) {
    if (!email || !password || email.length === 0 || password.length === 0) {
        console.log('User', email, 'failed to authenticate.');
        return Promise.reject(i18next.t('invalid_user_password', { email: email }));
    }

    // Loading user from DB.
    return User.forge({email: email})
               .fetch()
               .then(user => {
                   if (!user) return Promise.reject(i18next.t('invalid_user_password'));
                   if (!user.attributes.enabled) return Promise.reject(i18next.t('user_disabled'));
                   if (!user.attributes.validated) return Promise.reject(i18next.t('user_not_validated'));
                   if (!user.attributes.password || !user.validPassword(password)) return Promise.reject(i18next.t('invalid_user_password'));
                   console.log('logged in!!!');
                   return Promise.resolve(user);
               });
};

// var drupal_login = function (email, password, done) {
//     login(email, password, function (isLoggedIn, user, error) {
//         drupal_login_request(email, password).then(function (drupal_user) {
//             if (drupal_user != null) {
//                 // Drupal update information.
//                 var drupal_user_id = drupal_user.user.uid;
//                 var tickets = drupal_user.user.data.tickets.tickets;
//                 var current_event_tickets_count = 0;
//                 var tickets_array = [];
//                 _.each(tickets, (ticket, ticket_id) => {
//                     if (ticket.trid) {
//                         var _ticket = {
//                             trid: ticket.trid,
//                             user_uid: ticket.user_uid,
//                             bundle: ticket.bundle,
//                             barcode: _.get(ticket, 'field_ticket_barcode.und.0.value', ''),
//                             serial_id: _.get(ticket, 'field_ticket_serial_id.und.0.value', '')
//                         };
//                         _ticket.is_mine = (_ticket.user_uid === drupal_user_id);
//                         if (constants.events[constants.CURRENT_EVENT_ID].bundles.indexOf(_ticket.bundle) > -1) {
//                             _ticket.event_id = constants.CURRENT_EVENT_ID;
//                             if (_ticket.is_mine) {
//                                 current_event_tickets_count++;
//                             }
//                         }
//                         tickets_array.push(_ticket);
//                     }
//                 });
//
//                 var drupal_details = {
//                     created_at: (new Date(parseInt(_.get(drupal_user, 'user.created', 0)) * 1000)).toISOString().substring(0, 19).replace('T', ' '),
//                     updated_at: (new Date()).toISOString().substring(0, 19).replace('T', ' '),
//                     first_name: _.get(drupal_user, 'user.field_profile_first.und.0.value', ''),
//                     last_name: _.get(drupal_user, 'user.field_profile_last.und.0.value', ''),
//                     cell_phone: _.get(drupal_user, 'user.field_profile_phone.und.0.value', ''),
//                     address: _.get(drupal_user, 'user.field_profile_address.und.0.thoroughfare', '') + ' ' + _.get(drupal_user, 'user.field_profile_address.und.0.locality', '') + ' ' + _.get(drupal_user, 'user.field_profile_address.und.0.country', ''),
//                     israeli_id: _.get(drupal_user, 'user.field_field_profile_document_id.und.0.value', ''),
//                     date_of_birth: _.get(drupal_user, 'user.field_profile_birth_date.und.0.value', ''),
//                     gender: _.get(drupal_user, 'user.field_sex.und.0.value', constants.USER_GENDERS_DEFAULT).toLowerCase(),
//                     current_event_id_ticket_count: current_event_tickets_count,
//                     validated: true
//                 };
//
//                 var details_json_data = {
//                     address: {
//                         first_name: _.get(drupal_user, 'user.field_profile_address.und.0.first_name', ''),
//                         last_name: _.get(drupal_user, 'user.field_profile_address.und.0.last_name', ''),
//                         street: _.get(drupal_user, 'user.field_profile_address.und.0.thoroughfare', ''),
//                         city: _.get(drupal_user, 'user.field_profile_address.und.0.locality', ''),
//                         country: _.get(drupal_user, 'user.field_profile_address.und.0.country', '')
//                     },
//                     foreign_passport: _.get(drupal_user, 'user.field_profile_address.und.0.country', '')
//                 };
//
//                 var addinfo_json = {};
//                 if (user && typeof user.attributes.addinfo_json === 'string') {
//                     addinfo_json = JSON.parse(user.attributes.addinfo_json);
//                 }
//                 addinfo_json.drupal_data = details_json_data;
//                 addinfo_json.tickets = tickets_array;
//                 drupal_details.addinfo_json = JSON.stringify(addinfo_json);
//
//                 if (user === null) {
//                     signup(email, password, drupal_details, function (newUser, error) {
//                         if (newUser) {
//                             done(newUser);
//                         } else {
//                             done(false, error);
//                         }
//                     })
//                 }
//                 else {
//                     // we are now updating user data every login
//                     // to fetch latest user information. very important is to know
//                     // that once spark will be the main system, this all should be removed!
//                     user.save(drupal_details).then((user) => {
//                         done(user);
//                     });
//
//                     console.log('User', email, 'authenticated successfully in Drupal and synchronized to Spark.');
//                 }
//             }
//             else {
//                 if (isLoggedIn) {
//                     done(user);
//                 }
//                 else {
//                     done(false, i18next.t('invalid_user_password'));
//                 }
//             }
//         });
//     });
// };

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

module.exports = {
    signup: signup,

    sign_up: function (email, password, user, done) {
        signup(email, password, user, done)
    },

    login: login
};

