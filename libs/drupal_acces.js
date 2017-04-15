require('dotenv').config()
var request = require('superagent');
var logger = require('../libs/logger')(module);
var drupalConfig = require('config').get('profiles_api');

function parseFromAnchorTag(uid_string) {
    var re = /<a.*>(.+)<\/a>/g;
    m = re.exec(uid_string);
    re.lastIndex = 0;
    if (m.length === 2) {
        return m[1];
    } else {
        return undefined;
    }
}

function parseUser(res_body) {
    if (res_body.length === 0) {
        return undefined
    }

    return {
        last_name: res_body[0]['Last name'],
        first_name: res_body[0]['First name'],
        uid: res_body[0]['uid'],
        email: parseFromAnchorTag(res_body[0]['E-mail']),
        phone: res_body[0]['Phone number'],
        has_ticket: res_body[0]['PHP'] !== ""
    };
}

var login = (function() {
    let request_agent = false;
    logger.info('DRUPAL_PROFILE_API_URL: ' + drupalConfig.url +
        ", DRUPAL_PROFILE_API_USER: " + drupalConfig.username)

    return function(forceLogin) {
        //TEMPORARY DISABLE COOKIE REUSE TILL BETTER SOLUTION:
        forceLogin = true;
        return new Promise((resolve, reject) => {
            if (request_agent && !forceLogin) {
                resolve({ request_agent })
            } else {
                request_agent = request.agent();
                request_agent
                    .post(drupalConfig.url + '/api/user/login')
                    .accept('application/json')
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send({ 'username': drupalConfig.username, 'password': drupalConfig.password })
                    .then((res) => {
                        resolve({ request_agent });
                    }).catch((err) => {
                        request_agent = false;
                        reject(err)
                    });
            }
        });
    };
})();

var search_multiple_uids = function(login_data, uid_arr) {
    var tasks = uid_arr.map((uid) => {
        return search(login_data, null, uid);
    });
    return Promise.all(tasks);
}

var search_multiple_emails = function(login_data, email_arr) {
    var tasks = email_arr.map((mail) => {
        return search(login_data, mail);
    });
    return Promise.all(tasks);
}

var search = function(login_data, email, uid, is_retry) {
    return new Promise((resolve, reject) => {
        var qs = {};
        if (email) {
            qs.mail = email
        }
        if (uid) {
            qs.uid = uid
        }
        login_data.request_agent
            .get(drupalConfig.url + '/en/api/usersearch')
            .query(qs)
            .then((res) => {
                var user_data_ = parseUser(res.body)
                resolve({ email: qs.mail, uid: qs.uid, user_data: user_data_ });
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
                } else {
                    reject(err);
                }

            });
    });
};

var DrupalAccess = {
    //This is a temporary stub as long as we dont have connection to Drupal.
    get_user_info: function(uid_arr, is_retry) {
        return login().then(login_data =>
            search_multiple_uids(login_data, uid_arr)
        ).catch(err => {
            logger.error(err)
            login(true);
        });
    },
    get_user_by_email: function(email_arr, is_retry) {
        return login().then(login_data =>
            search_multiple_emails(login_data, email_arr)
        ).catch(err => {
            logger.error(err)
            login(true);
        });
    }
}
module.exports = {
    DrupalAccess: DrupalAccess
};