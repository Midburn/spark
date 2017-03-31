var request = require('superagent');
var logger = require('../libs/logger');

var DRUPAL_PROFILE_API_URL = process.env.DRUPAL_PROFILE_API_URL;
var DRUPAL_PROFILE_API_USER = process.env.DRUPAL_PROFILE_API_USER;
var DRUPAL_PROFILE_API_PASSWORD = process.env.DRUPAL_PROFILE_API_PASSWORD;

var _parse_user = function(res_body) {
    if (res_body.length === 0) {
        return undefined
    }
    return {
        last_name: res_body[0]['Last name'],
        first_name: res_body[0]['First name']
    };
}

var login = function() {
    return new Promise((resolve, reject) => {
        var agent = request.agent();
        agent
            .post(DRUPAL_PROFILE_API_URL + '/api/user/login')
            .accept('application/json')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({ 'username': DRUPAL_PROFILE_API_USER, 'password': DRUPAL_PROFILE_API_PASSWORD })
            .then((res) => {
                resolve({ request_agent: agent });
            }).catch((err) => {
                reject(err)
            });
    });
};


var search_multiple_emails = function(login_data, emails) {
    var tasks = mails.map((mail) => {

        return search(login_data, mail);
    });

    return Promise.all(tasks);
}

var search = function(login_data, email, first_name, last_name, uid) {
    return new Promise((resolve, reject) => {
        var qs = {};
        if (first_name) {
            qs.field_profile_first_value = first_name
        }
        if (last_name) {
            qs.field_profile_last_value = last_name
        }
        if (email) {
            qs.mail = email
        }
        if (uid) {
            qs.uid = uid
        }
        login_data.request_agent
            .get(DRUPAL_PROFILE_API_URL + '/en/api/usersearch')
            //.accept('application/json')
            .query(qs)
            .then((res) => {
                resolve({ res: _parse_user(res.body), query: qs });
            }).catch((err) => {
                console.error(err);
            });
    });
};

var DrupalAccess = {
    //This is a temporary stub as long as we dont have connection to Drupal.
    get_user_info: function(user_id) {
        return new Promise((resolve, reject) => {
            //access drupal to get data...
            //GET https://<env(DRUPAL_PROFILE_API)>/api/views/api_user_search?uid=1467
            var user_data = {
                id: user_id,
                email: 'name@domain.com'
            }
            resolve(user_data);
        });
    },
    get_user_by_email: function(email_arr) {
        return login().then(login_data =>
            search_multiple_emails(login_data, mails)
        ).catch(err =>
            logger.error(err)
        );
    }
}
module.exports = {
    DrupalAccess: DrupalAccess
};