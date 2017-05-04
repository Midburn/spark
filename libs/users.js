const i18next = require('i18next');
const User = require('../models/user').User;
const constants = require('../models/constants');
const request = require('superagent');
const _ = require('lodash');

/***
 * tries to login based on drupal users table
 * once user is successfully logged-in, an automatic sign-up flow is performed which creates a corresponding spark user
 * @param email
 * @param password
 * @param done
 */
const drupalLoginRequest = (email, password) =>
    // .post('https://profile-test.midburn.org/api/user/login')
    request
        .post('https://profile.midburn.org/api/user/login')
        .send({'username': email, 'password': password})
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .then(({ body }) => body, () => null);

const login = function (email, password, done) {
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

const drupalLogin = function (email, password, done) {
    login(email, password, function (isLoggedIn, user, error) {
        drupalLoginRequest(email, password).then(function (drupal_user) {
            if (drupal_user != null) {
                // Drupal update information.
                const drupal_user_id = drupal_user.user.uid;
                const tickets = drupal_user.user.data.tickets.tickets;
                let current_event_tickets_count = 0;
                const tickets_array = [];
                _.each(tickets, (ticket, ticket_id) => {
                    if (ticket.trid) {
                        const _ticket = {
                            trid: ticket.trid,
                            user_uid: ticket.user_uid,
                            bundle: ticket.bundle,
                            barcode: _.get(ticket, 'field_ticket_barcode.und.0.value', ''),
                            serial_id: _.get(ticket, 'field_ticket_serial_id.und.0.value', '')
                        };
                        _ticket.is_mine = (_ticket.user_uid === drupal_user_id);
                        if (constants.events[constants.CURRENT_EVENT_ID].bundles.indexOf(_ticket.bundle) > -1) {
                            _ticket.event_id = constants.CURRENT_EVENT_ID;
                            if (_ticket.is_mine) {
                                current_event_tickets_count++;
                            }
                        }
                        tickets_array.push(_ticket);
                    }
                });

                const drupal_details = {
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

                const details_json_data = {
                    address: {
                        first_name: _.get(drupal_user, 'user.field_profile_address.und.0.first_name', ''),
                        last_name: _.get(drupal_user, 'user.field_profile_address.und.0.last_name', ''),
                        street: _.get(drupal_user, 'user.field_profile_address.und.0.thoroughfare', ''),
                        city: _.get(drupal_user, 'user.field_profile_address.und.0.locality', ''),
                        country: _.get(drupal_user, 'user.field_profile_address.und.0.country', '')
                    },
                    foreign_passport: _.get(drupal_user, 'user.field_profile_address.und.0.country', '')
                };

                let addinfo_json = {};
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

const signup = function (email, password, user, done) {
    const userPromise = new User({
        email: email
    }).fetch();
    userPromise.then(function (model) {
        if (model) {
            done(false, i18next.t('user_exists'))
        } else {
            const newUser = new User({
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

const loginLocal = (email, password) => {
    return new Promise((resolve, reject) =>
        drupalLogin(email, password, (user, error) => {
            if (user) {
                resolve(user);
            } else {
                reject(error);
            }}));
};

module.exports = {
    signup: signup,

    sign_up: function (email, password, user, done) {
        signup(email, password, user, done)
    },

    login: loginLocal
};

