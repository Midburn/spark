var request = require('superagent');
var logger = require('../libs/logger')(module);

var DRUPAL_PROFILE_API_URL = process.env.DRUPAL_PROFILE_API_URL;
var DRUPAL_PROFILE_API_USER = process.env.DRUPAL_PROFILE_API_USER;
var DRUPAL_PROFILE_API_PASSWORD = process.env.DRUPAL_PROFILE_API_PASSWORD;

function _parse_fron_anchor_tag(uid_string) {
    var re = /<a.*>(.+)<\/a>/g;
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
        uid: _parse_fron_anchor_tag(res_body[0]['Uid']),
        email: _parse_fron_anchor_tag(res_body[0]['E-mail']),
        phone: res_body[0]['Phone number'],
    };
}
var login = function (forceLogin) {
    let request_agent = false;
    return function (forceLogin) {
        return new Promise((resolve, reject) => {
            if (request_agent && !forceLogin) {
                resolve({ request_agent })
            } else {
                request_agent = request.agent();
                request_agent
                    .post(DRUPAL_PROFILE_API_URL + '/api/user/login')
                    .accept('application/json')
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send({ 'username': DRUPAL_PROFILE_API_USER, 'password': DRUPAL_PROFILE_API_PASSWORD })
                    .then((res) => {
                        resolve({ request_agent });
                    }).catch((err) => {
                        request_agent = false;
                        reject(err)
                    });
            }
        });
    };
}();

var search_multiple_uids = function (login_data, uid_arr) {
    var tasks = uid_arr.map((uid) => {
        return search(login_data, null, uid);
    });
    return Promise.all(tasks);
}

var search_multiple_emails = function (login_data, email_arr) {
    var tasks = email_arr.map((mail) => {
        return search(login_data, mail);
    });
    return Promise.all(tasks);
}

var search = function (login_data, email, uid, is_retry) {
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
                var user_data_ = _parse_user(res.body)
                user_response = { email: qs.mail, uid: qs.uid, user_data: user_data_ };
                resolve(user_response);
            }).catch((err) => {

                if (err.status === 403 && !is_retry) {

                    logger.error(err)
                    login(true);

                /*  
                //need to check if this shit work...
                  return login(true).then(login_data =>
                        search(login_data, email, uid, true)
                    ).catch(err => {
                        reject(err);
                    });
*/
                }
                else {
                    reject(err);
                }


            });
    });
};

var DrupalAccess = {
    //This is a temporary stub as long as we dont have connection to Drupal.
    get_user_info: function (uid_arr, is_retry) {
        return login().then(login_data =>
            search_multiple_uids(login_data, uid_arr)
        ).catch(err => {
            logger.error(err)
            login(true);
        }
            );
    },
    get_user_by_email: function (email_arr, is_retry) {
        return login().then(login_data =>
            search_multiple_emails(login_data, email_arr)
        ).catch(err => {
            logger.error(err)
            login(true);
        }
            );
    }
}
module.exports = {
    DrupalAccess: DrupalAccess
};