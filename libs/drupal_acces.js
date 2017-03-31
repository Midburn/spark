var request = require('superagent');
var logger = require('../libs/logger')(module);

var DRUPAL_PROFILE_API_URL = process.env.DRUPAL_PROFILE_API_URL;
var DRUPAL_PROFILE_API_USER = process.env.DRUPAL_PROFILE_API_USER;
var DRUPAL_PROFILE_API_PASSWORD = process.env.DRUPAL_PROFILE_API_PASSWORD;


function _parse_uid(uid_string) {
    var re = /<a.*>(\d+)<\/a>/g;
    m = re.exec(uid_string);
    re.lastIndex = 0;
    if (m.length === 2) {
        return m[1];
    } else {
        return undefined;
    }
}

function _parse_user(res_body) {
    if (res_body.length === 0) {
        return undefined
    }
    return {
        last_name: res_body[0]['Last name'],
        first_name: res_body[0]['First name'],
        uid: _parse_uid(res_body[0]['Uid'])
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


var search_multiple_emails = function(login_data, email_arr) {
    var tasks = email_arr.map((mail) => {
        return search(login_data, mail);
    });
    return Promise.all(tasks);
}

var search = function(login_data, email, first_name, last_name, uid) {
    return new Promise((resolve, reject) => {
        var qs = {};
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
                user_response = { mail: qs.mail, uid: qs.uid, user_data: _parse_user(res.body) };
                resolve(user_response);
            }).catch((err) => {
                reject(err);
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
            search_multiple_emails(login_data, email_arr)
        ).catch(err =>
            logger.error(err)
        );
    }
}
module.exports = {
    DrupalAccess: DrupalAccess
};